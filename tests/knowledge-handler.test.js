// @vitest-environment node
import { EventEmitter } from 'node:events';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import { createKnowledgeHandler } from '../api/knowledge.js';

const fixture = { id: 'one', score: .8, metadata: { schema: 3, retrievalMode: 'dense', articleId: 'a', articleHash: 'v1', category: 'world', site: 'world', title: '终末阵列', section: '规则', text: '原文资料', url: 'https://world.sch-nie.com/', nextId: 'two' } };
function response() {
  return Object.assign(new EventEmitter(), { statusCode: 200, writableEnded: false, headers: {},
    setHeader(k, v) { this.headers[k] = v; }, status(n) { this.statusCode = n; return this; },
    json(value) { this.body = value; this.writableEnded = true; return this; }, end() { this.writableEnded = true; return this; } });
}
function request(body = { query: '终末阵列是什么？' }) {
  return { method: 'POST', headers: { 'content-type': 'application/json' }, socket: { remoteAddress: '127.0.0.1' }, body };
}
let services, handler, cache;
beforeEach(() => {
  vi.stubEnv('VERCEL', '0'); vi.stubEnv('VECTOR_EMBEDDING_MODE', 'upstash-data'); vi.stubEnv('CHAT_MIN_SCORE', '0.35');
  vi.stubEnv('DEEPSEEK_API_KEY', ''); vi.stubEnv('TURNSTILE_SECRET_KEY', 'enabled-for-chat-only');
  cache = new Map();
  services = { minute: { limit: vi.fn().mockResolvedValue({ success: true }) },
    redis: { get: vi.fn(async key => cache.get(key) ?? null), set: vi.fn(async (key, value) => { cache.set(key, value); return 'OK'; }) },
    index: { query: vi.fn().mockResolvedValue([fixture]), fetch: vi.fn().mockResolvedValue([]) } };
  handler = createKnowledgeHandler(() => services, () => '# 内容总览\n文章数：2；总字数：12345。');
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

it('retrieves anonymous sources without model credentials, captcha or generation budget', async () => {
  const res = response(); await handler(request(), res);
  expect(res.statusCode).toBe(200);
  expect(res.body).toMatchObject({ schema: 1, operation: 'search', site: 'all', query: '终末阵列是什么？', sources: [{ title: '终末阵列', text: '原文资料' }] });
  expect(res.body.requestId).toMatch(/^[\da-f-]{36}$/);
  expect(res.body.sources[0].id).toMatch(/^[0-9a-f]{16}$/);
  expect(res.headers['Access-Control-Allow-Origin']).toBe('*');
  expect(res.headers['Access-Control-Allow-Credentials']).toBeUndefined();
  expect(res.headers['Set-Cookie']).toBeUndefined();
  expect(services.index.query.mock.calls[0][0]).toMatchObject({ data: '终末阵列是什么？', topK: 16, includeMetadata: true });
});
it('filters by source website independently of normalized content classification', async () => {
  services.index.query.mockResolvedValue([
    { ...fixture, metadata: { ...fixture.metadata, title: '灵耀体系：木缘桑庭', section: '[金泽范式](https://world.sch-nie.com/posts/23.html)' } },
    { ...fixture, metadata: { ...fixture.metadata, site: 'blog', text: '其它网站' } },
  ]);
  const res = response(); await handler(request({ query: '金泽范式', site: 'world', mode: 'scholar' }), res);
  expect(res.body.sources).toHaveLength(1);
  expect(res.body.sources[0]).toMatchObject({ category: 'zero', site: 'world', title: '金泽范式', url: 'https://zero.sch-nie.com/core/' });
  expect(services.index.query.mock.calls[0][0].filter).toBe("schema = 3 AND retrievalMode = 'dense' AND site = 'world'");
});
it.each([{ apiKey: 'secret-never-echo' }, { model: 'secret-never-echo' }, { category: 'all' }, { query: '' }, { query: 'x'.repeat(1201) }, { site: "world' OR true" }, { mode: 'invalid' }, { operation: 'generate' }, []])('rejects invalid inputs and unknown credential fields without echo: %s', async extra => {
  const res = response(); await handler(request(Array.isArray(extra) ? extra : { query: 'test', ...extra }), res);
  expect(res.statusCode).toBe(400);
  expect(res.body.code).toBe('INPUT_INVALID');
  expect(JSON.stringify(res.body)).not.toContain('secret-never-echo');
  expect(services.index.query).not.toHaveBeenCalled();
});
it('rejects invalid media types and oversized bytes before retrieval', async () => {
  const wrong = request(); wrong.headers['content-type'] = 'text/plain';
  const a = response(); await handler(wrong, a); expect(a.statusCode).toBe(415);
  const large = request(); large.headers['content-length'] = '20000';
  const b = response(); await handler(large, b); expect(b.statusCode).toBe(413);
  const actual = response(); await handler(request({ query: 'test', extra: 'x'.repeat(20000) }), actual); expect(actual.statusCode).toBe(413);
  expect(services.index.query).not.toHaveBeenCalled();
});
it('overview returns the bounded authoritative snapshot without querying vectors', async () => {
  const res = response(); await handler(request({ operation: 'overview', site: 'zero' }), res);
  expect(res.body).toMatchObject({ schema: 1, operation: 'overview', query: '', site: 'zero', sources: [] });
  expect(res.body.overview).toContain('回答范围：zero');
  expect(res.body.overview).toContain('全站总数不能作为所选网站的总数');
  expect(res.body.overview).toContain('按网站来源');
  expect(res.body.overview).toMatch(/# 内容总览\n文章数：2；总字数：12345。$/);
  expect(services.index.query).not.toHaveBeenCalled();
});
it('GET capability readiness and OPTIONS never invoke service or vector operations', async () => {
  const provide = vi.fn(() => { throw new Error('must not connect'); });
  const local = createKnowledgeHandler(provide);
  for (const method of ['GET', 'OPTIONS']) {
    const req = request(); req.method = method;
    const res = response(); await local(req, res);
    expect(res.statusCode).toBe(method === 'OPTIONS' ? 204 : 200);
    if (method === 'GET') expect(res.body).toMatchObject({ schema: 1, operations: ['search', 'overview'], generation: false, ready: expect.any(Boolean) });
  }
  expect(provide).not.toHaveBeenCalled();
});
it('short cache reuses sources but creates a fresh request identity and still rate limits', async () => {
  const a = response(); await handler(request(), a);
  const b = response(); await handler(request(), b);
  expect(b.body.sources).toEqual(a.body.sources);
  expect(b.body.requestId).not.toBe(a.body.requestId);
  expect(services.index.query).toHaveBeenCalledTimes(1);
  expect(services.redis.set.mock.calls[0][2]).toMatchObject({ ex: 60 });
  expect(services.minute.limit).toHaveBeenCalledTimes(2);
  const c = response(); await handler(request({ query: '终末阵列是什么？', site: 'world' }), c);
  expect(services.index.query).toHaveBeenCalledTimes(2);
});
it('distributed limiter blocks before retrieval and returns Retry-After', async () => {
  services.minute.limit.mockResolvedValue({ success: false, reset: Date.now() + 2500 });
  const res = response(); await handler(request(), res);
  expect(res.statusCode).toBe(429); expect(res.body.code).toBe('RATE_LIMITED');
  expect(Number(res.headers['Retry-After'])).toBeGreaterThan(0);
  expect(services.index.query).not.toHaveBeenCalled();
});
it('limiter timeout fails closed even when upstream reports success', async () => {
  services.minute.limit.mockResolvedValue({ success: true, reason: 'timeout' });
  const res = response(); await handler(request(), res);
  expect(res.statusCode).toBe(503); expect(services.index.query).not.toHaveBeenCalled();
});
it('never returns raw upstream secrets in errors', async () => {
  services.index.query.mockRejectedValue(new Error('Bearer secret-never-echo https://private-token.example'));
  const res = response(); await handler(request(), res);
  expect(res.statusCode).toBe(503); expect(res.body.code).toBe('KNOWLEDGE_UNAVAILABLE');
  expect(JSON.stringify(res.body)).not.toMatch(/secret-never-echo|private-token/);
});
it('stops waiting after 12 seconds and does not start adjacent or cache work', async () => {
  vi.useFakeTimers(); services.index.query.mockImplementation(() => new Promise(() => {}));
  const res = response(); const pending = handler(request(), res);
  await vi.advanceTimersByTimeAsync(12000); await pending;
  expect(res.statusCode).toBe(503); expect(res.body.code).toBe('KNOWLEDGE_TIMEOUT');
  expect(services.index.fetch).not.toHaveBeenCalled(); expect(services.redis.set).not.toHaveBeenCalled();
});
it('client disconnect aborts the request without starting further work', async () => {
  services.index.query.mockImplementation(() => new Promise(() => {}));
  const res = response(); const pending = handler(request(), res);
  await vi.waitFor(() => expect(services.index.query).toHaveBeenCalled());
  res.emit('close'); await pending;
  expect(services.index.fetch).not.toHaveBeenCalled(); expect(services.redis.set).not.toHaveBeenCalled();
});
it('source IDs survive ranking changes but change with article version or text', async () => {
  const first = response(); await handler(request({ query: 'one' }), first);
  services.index.query.mockResolvedValue([{ ...fixture, score: .9 }]);
  const second = response(); await handler(request({ query: 'two' }), second);
  expect(first.body.sources[0].id).toBe(second.body.sources[0].id);
  services.index.query.mockResolvedValue([{ ...fixture, metadata: { ...fixture.metadata, articleHash: 'v2' } }]);
  const third = response(); await handler(request({ query: 'three' }), third);
  expect(third.body.sources[0].id).not.toBe(first.body.sources[0].id);
  services.index.query.mockResolvedValue([{ ...fixture, metadata: { ...fixture.metadata, text: '修订后的原文' } }]);
  const fourth = response(); await handler(request({ query: 'four' }), fourth);
  expect(fourth.body.sources[0].id).not.toBe(first.body.sources[0].id);
});
it('safe URLs and adjacent snippets retain existing selector safeguards', async () => {
  services.index.query.mockResolvedValue([{ ...fixture, metadata: { ...fixture.metadata, url: 'javascript:alert(1)' } }]);
  services.index.fetch.mockResolvedValue([
    { id: 'two', metadata: { ...fixture.metadata, text: '相邻原文' } },
    { id: 'bad', metadata: { ...fixture.metadata, articleHash: 'wrong', text: '错误版本' } },
  ]);
  const res = response(); await handler(request(), res);
  expect(res.body.sources).toHaveLength(2);
  expect(res.body.sources[0].url).toBe('https://launcher.sch-nie.com/');
  expect(res.body.sources[1].text).toBe('相邻原文');
  expect(services.index.fetch.mock.calls[0][0]).toEqual(['two']);
});

it('uses existing external embedding configuration and abort signal without a generation call', async () => {
  vi.stubEnv('VECTOR_EMBEDDING_MODE', 'external'); vi.stubEnv('VECTOR_EMBEDDING_MODEL', 'existing-embedding');
  vi.stubEnv('VECTOR_EMBEDDING_DIMENSION', '2'); vi.stubEnv('VECTOR_EMBEDDING_URL', 'https://embeddings.example/v1/embeddings');
  vi.stubEnv('VECTOR_EMBEDDING_API_KEY', 'embedding-only-secret');
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ index: 0, embedding: [.2, .4] }] })));
  vi.stubGlobal('fetch', fetcher);
  const res = response(); await handler(request(), res);
  expect(res.statusCode).toBe(200);
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher.mock.calls[0][0]).toBe('https://embeddings.example/v1/embeddings');
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ model: 'existing-embedding', input: ['终末阵列是什么？'], encoding_format: 'float' });
  expect(fetcher.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  expect(services.index.query.mock.calls[0][0]).toMatchObject({ vector: [.2, .4] });
  expect(services.index.query.mock.calls[0][0].data).toBeUndefined();
  expect(JSON.stringify(res.body)).not.toContain('embedding-only-secret');
});

it('keeps retrieval context within 6000 characters and mode-specific source limits', async () => {
  services.index.query.mockResolvedValue(Array.from({ length: 16 }, (_, i) => ({ ...fixture, id: String(i), metadata: { ...fixture.metadata, nextId: '', articleId: String(i), text: `${i}:` + 'x'.repeat(500) } })));
  for (const [mode, count] of [['chat', 4], ['tutor', 6], ['scholar', 10]]) {
    const res = response(); await handler(request({ query: 'context', mode }), res);
    expect(res.body.sources).toHaveLength(count);
    expect(res.body.sources.reduce((sum, source) => sum + source.text.length, 0)).toBeLessThanOrEqual(6000);
  }
});

it('health distinguishes missing retrieval configuration from credentials for generation', async () => {
  const get = request(); get.method = 'GET';
  for (const key of ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'UPSTASH_VECTOR_REST_URL', 'UPSTASH_VECTOR_REST_TOKEN']) vi.stubEnv(key, 'configured');
  const ready = response(); await handler(get, ready); expect(ready.body.ready).toBe(true);
  vi.stubEnv('UPSTASH_VECTOR_REST_TOKEN', '');
  const missing = response(); await handler(get, missing); expect(missing.body.ready).toBe(false);
});

it('ignores spoofable forwarded-for locally and uses the trusted Vercel IP in production', async () => {
  const local = request(); local.headers['x-forwarded-for'] = 'attacker';
  const a = response(); await handler(local, a); expect(a.statusCode).toBe(200);
  const firstIdentity = services.minute.limit.mock.calls[0][0];
  vi.stubEnv('VERCEL', '1');
  const trusted = request(); trusted.headers['x-vercel-forwarded-for'] = '192.0.2.1';
  const b = response(); await handler(trusted, b); expect(b.statusCode).toBe(200);
  expect(services.minute.limit.mock.calls[1][0]).not.toBe(firstIdentity);
  const untrusted = request(); untrusted.headers['x-forwarded-for'] = '192.0.2.1';
  const c = response(); await handler(untrusted, c); expect(c.statusCode).toBe(503);
});
