// @vitest-environment node
import { createHmac } from 'node:crypto';
import { afterEach, expect, it, vi } from 'vitest';
import { createContentUpdateHandler } from '../api/content-update.js';

const secret = '0123456789abcdef0123456789abcdef';
function request(payload, valid = true) {
  const raw = JSON.stringify(payload);
  return { method: 'POST', body: Buffer.from(raw), headers: { 'x-github-event': 'push', 'x-hub-signature-256': 'sha256=' + createHmac('sha256', valid ? secret : 'wrong').update(raw).digest('hex') } };
}
function response() { return { statusCode: 0, setHeader() {}, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } }; }
afterEach(() => vi.unstubAllEnvs());
it('签名正确且为已配置源站的 source 推送时通知 launcher，不向源仓库写入', async () => {
  vi.stubEnv('CONTENT_SYNC_WEBHOOK_SECRET', secret); vi.stubEnv('CONTENT_SYNC_GITHUB_TOKEN', 'test-token');
  const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  const reserve = vi.fn().mockResolvedValue(true), release = vi.fn();
  const handler = createContentUpdateHandler({ fetcher, reserve, release });
  const res = response();
  await handler(request({ repository: { full_name: 'schrolemons/openwd.github.io' }, ref: 'refs/heads/source', after: 'a'.repeat(40) }), res);
  expect(res.statusCode).toBe(202);
  expect(fetcher.mock.calls[0][0]).toBe('https://api.github.com/repos/schrolemons/launcher.github.io/dispatches');
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toMatchObject({ event_type: 'source-content-updated', client_payload: { site: 'world' } });
});
it('伪造签名、未知仓库和部署分支都不能触发同步，重复正文不重复派发', async () => {
  vi.stubEnv('CONTENT_SYNC_WEBHOOK_SECRET', secret); vi.stubEnv('CONTENT_SYNC_GITHUB_TOKEN', 'test-token');
  const fetcher = vi.fn(), handler = createContentUpdateHandler({ fetcher, reserve: async () => false, release: async () => {} });
  const payload = { repository: { full_name: 'schrolemons/openwd.github.io' }, ref: 'refs/heads/source' };
  const invalid = response(); await handler(request(payload, false), invalid); expect(invalid.statusCode).toBe(401);
  const unknown = response(); await handler(request({ ...payload, repository: { full_name: 'attacker/repo' } }), unknown); expect(unknown.statusCode).toBe(403);
  const ignored = response(); await handler(request({ ...payload, ref: 'refs/heads/main' }), ignored); expect(ignored.statusCode).toBe(202);
  const duplicate = response(); await handler(request(payload), duplicate); expect(duplicate.body.duplicate).toBe(true);
  expect(fetcher).not.toHaveBeenCalled();
});
it('从原始请求流验签，不触发 Vercel 的惰性 JSON body getter', async () => {
  vi.stubEnv('CONTENT_SYNC_WEBHOOK_SECRET', secret); vi.stubEnv('CONTENT_SYNC_GITHUB_TOKEN', 'test-token');
  const payload = { repository: { full_name: 'schrolemons/openwd.github.io' }, ref: 'refs/heads/source' };
  const req = request(payload), raw = req.body;
  Object.defineProperty(req, 'body', { get() { throw new Error('JSON body parser must not run'); } });
  req[Symbol.asyncIterator] = async function* () { yield raw.subarray(0, 10); yield raw.subarray(10); };
  const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  const res = response();
  await createContentUpdateHandler({ fetcher, reserve: async () => true, release: async () => {} })(req, res);
  expect(res.statusCode).toBe(202);
  expect(fetcher).toHaveBeenCalledTimes(1);
});
