import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { Redis } from '@upstash/redis';
import { SOURCE_SITES, LAUNCHER_REPOSITORY } from '../lib/source-sites.js';

let redis;
function getRedis() { return redis ||= Redis.fromEnv(); }
async function readRaw(req) {
  const chunks = []; let bytes = 0;
  // Vercel exposes body as a lazy JSON getter. Do not access it before the raw stream.
  const stream = typeof req[Symbol.asyncIterator] === 'function' ? req
    : Buffer.isBuffer(req.body) || typeof req.body === 'string' ? [req.body] : [];
  for await (const chunk of stream) {
    bytes += Buffer.byteLength(chunk);
    if (bytes > 2 * 1024 * 1024) throw new Error('Webhook payload too large');
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
export function createContentUpdateHandler({ fetcher = fetch,
  reserve = async key => (await getRedis().set(key, 'pending', { nx: true, ex: 86400 })) === 'OK',
  release = async key => getRedis().del(key),
} = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST required' });
    const secret = process.env.CONTENT_SYNC_WEBHOOK_SECRET || '', token = process.env.CONTENT_SYNC_GITHUB_TOKEN || '';
    if (secret.length < 32 || !token) return res.status(503).json({ error: 'Content sync webhook is not configured' });
    let key = '', acquired = false;
    try {
      const raw = await readRaw(req);
      const supplied = String(req.headers['x-hub-signature-256'] || '');
      const expected = 'sha256=' + createHmac('sha256', secret).update(raw).digest('hex');
      if (!/^sha256=[a-f0-9]{64}$/.test(supplied) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected))) return res.status(401).json({ error: 'Invalid webhook signature' });
      const payload = JSON.parse(raw.toString('utf8'));
      const site = SOURCE_SITES.find(item => item.repository === payload.repository?.full_name);
      if (!site) return res.status(403).json({ error: 'Unknown source repository' });
      const event = req.headers['x-github-event'];
      if (event === 'ping') return res.status(200).json({ ok: true, site: site.id });
      if (event !== 'push' || payload.ref !== `refs/heads/${site.branch}` || payload.deleted) return res.status(202).json({ ignored: true });
      // Body digest is signed; an unsigned delivery-ID header cannot bypass deduplication.
      key = 'content-sync:webhook:' + createHash('sha256').update(raw).digest('hex');
      acquired = await reserve(key);
      if (!acquired) return res.status(202).json({ duplicate: true });
      const result = await fetcher(`https://api.github.com/repos/${LAUNCHER_REPOSITORY}/dispatches`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_type: 'source-content-updated', client_payload: { site: site.id, repository: site.repository, commit: String(payload.after || '').slice(0, 64) } }),
        signal: AbortSignal.timeout(8000),
      });
      if (!result.ok) throw new Error('GitHub dispatch failed');
      return res.status(202).json({ accepted: true, site: site.id });
    } catch (error) {
      if (acquired) await release(key).catch(() => {});
      return res.status(502).json({ error: 'Content sync could not be scheduled; retry this webhook delivery' });
    }
  };
}
export default createContentUpdateHandler();
export const config = { maxDuration: 10 };
