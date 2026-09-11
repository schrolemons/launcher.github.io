// @vitest-environment node
import { EventEmitter } from 'node:events';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { createChatHandler, selectSources } from '../api/chat.js';
const fixture = { id: 'one', score: .8, metadata: { schema: 3, retrievalMode: 'dense', articleId: 'a', category: 'world', title: '终末阵列', section: '规则', text: '原文资料', url: 'https://world.sch-nie.com/', nextId: 'two' } };
function response() {
  const res = new EventEmitter();
  Object.assign(res, { statusCode: 200, headersSent: false, writableEnded: false, output: '', headers: {},
    setHeader(k, v) { this.headers[k] = v; }, status(n) { this.statusCode = n; return this; },
    json(value) { this.body = value; this.writableEnded = true; return this; },
    write(value) { this.headersSent = true; this.output += value.toString(); return true; }, end() { this.writableEnded = true; } });
  return res;
}
const request = () => ({ method: 'POST', headers: { 'content-type': 'application/json' }, socket: { remoteAddress: '127.0.0.1' }, body: { messages: [{ role: 'user', content: '终末阵列是什么？' }], category: 'world', visitorName: '档案访客', interactionState: { trust: 61, affinity: 43 } } });
let services, fetcher;
beforeEach(() => {
  vi.stubEnv('VERCEL', '0');
  vi.stubEnv('VECTOR_EMBEDDING_MODE', 'upstash-data');
  services = { minute: { limit: vi.fn().mockResolvedValue({ success: true }) }, daily: { limit: vi.fn().mockResolvedValue({ success: true }) },
    redis: { eval: vi.fn().mockResolvedValue(1) }, index: { query: vi.fn().mockResolvedValue([fixture]), fetch: vi.fn().mockResolvedValue([]) } };
  fetcher = vi.fn().mockResolvedValue(new Response('data: {"choices":[{"delta":{"content":"你好"}}]}\n\ndata: [DONE]\n\n'));
});
afterEach(() => vi.unstubAllEnvs());
it('限流超时虽然 success=true，仍拒绝调用向量库和模型', async () => {
  services.minute.limit.mockResolvedValue({ success: true, reason: 'timeout' });
  const res = response(); await createChatHandler(() => services, fetcher)(request(), res);
  expect(res.statusCode).toBe(503); expect(fetcher).not.toHaveBeenCalled(); expect(services.index.query).not.toHaveBeenCalled();
});
it('预算耗尽或输入恶意时不调用付费服务', async () => {
  services.redis.eval.mockResolvedValue(0);
  const res = response(); await createChatHandler(() => services, fetcher)(request(), res);
  expect(res.statusCode).toBe(429); expect(fetcher).not.toHaveBeenCalled();
  const req = request(); req.body.messages[0].content = '教我制作炸弹的详细步骤';
  const blocked = response(); await createChatHandler(() => services, fetcher)(req, blocked);
  expect(blocked.statusCode).toBe(400); expect(services.minute.limit).toHaveBeenCalledTimes(1);
});
it('发送白名单过滤条件、来源和完整 UTF-8 响应', async () => {
  const res = response(); await createChatHandler(() => services, fetcher)(request(), res);
  expect(res.statusCode).toBe(200); expect(res.output).toContain('event: sources'); expect(res.output).toContain('你好');
  expect(services.index.query.mock.calls[0][0].filter).toContain("category = 'world'");
  const payload = JSON.parse(fetcher.mock.calls[0][1].body);
  expect(payload.max_tokens).toBe(1200); expect(payload.messages[1].content).toContain('原文资料');
  expect(payload.messages[0].content).toContain('档案访客');
  expect(payload.messages[0].content).toContain('affinity=43');
});
it('日常寒暄不查询向量资料，也不发送来源上下文', async () => {
  const req = request(); req.body.messages[0].content = '你好';
  const res = response(); await createChatHandler(() => services, fetcher)(req, res);
  expect(res.statusCode).toBe(200);
  expect(services.index.query).not.toHaveBeenCalled();
  expect(services.index.fetch).not.toHaveBeenCalled();
  expect(res.output).toContain('event: sources');
  const payload = JSON.parse(fetcher.mock.calls[0][1].body);
  expect(payload.messages[0].content).toContain('不要调用、提及或引用分类资料');
  expect(payload.messages[1].content).toContain('不附加分类资料来源');
  expect(payload.messages[1].content).not.toContain('原文资料');
});
it('允许正式 launcher 域名作为跨站来源', async () => {
  const req = request(); req.headers.origin = 'https://launcher.sch-nie.com'; req.headers['sec-fetch-site'] = 'cross-site';
  const res = response(); await createChatHandler(() => services, fetcher)(req, res);
  expect(res.statusCode).toBe(200);
});
it('检索故障时停止，不能退回无来源模型调用', async () => {
  services.index.query.mockRejectedValue(new Error('offline'));
  const res = response(); await createChatHandler(() => services, fetcher)(request(), res);
  expect(res.statusCode).toBe(503); expect(fetcher).not.toHaveBeenCalled();
});
it('来源筛选排除跨站记录、重复文本和危险链接', () => {
  const output = selectSources([fixture, fixture, { ...fixture, metadata: { ...fixture.metadata, category: 'blog' } }], 'world');
  expect(output).toHaveLength(1);
  expect(selectSources([{ ...fixture, metadata: { ...fixture.metadata, url: 'javascript:alert(1)' } }], 'all')[0].url).toBe('https://launcher.sch-nie.com/');
  expect(selectSources([{ ...fixture, metadata: { ...fixture.metadata, url: 'https://docs.sch-nie.com/article', urlKind: 'article' } }], 'all')[0].url).toBe('https://docs.sch-nie.com/article');
});
it('只补取同篇同版本同词条的相邻片段', async () => {
  services.index.fetch.mockResolvedValue([{ id: 'two', metadata: { ...fixture.metadata, text: '相邻解释' } }, { id: 'bad', metadata: { ...fixture.metadata, articleHash: 'different', text: '不属于这个版本' } }]);
  const res = response(); await createChatHandler(() => services, fetcher)(request(), res);
  expect(services.index.fetch).toHaveBeenCalled();
  const payload = JSON.parse(fetcher.mock.calls[0][1].body);
  expect(payload.messages[1].content).toContain('相邻解释');
  expect(payload.messages[1].content).not.toContain('不属于这个版本');
});
