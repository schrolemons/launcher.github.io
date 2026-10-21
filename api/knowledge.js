import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Index } from '@upstash/vector';
import { createHash, randomUUID } from 'node:crypto';
import { isIP } from 'node:net';
import { retrieveSources, withinDeadline } from '../server/retrieval.js';
import { readContentOverview } from '../server/content-overview.js';
import { embeddingConfig } from '../server/embedding.js';
import { OVERVIEW_MAX_BYTES } from '../lib/overview-contract.js';

const SERVICE_KEYS = ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN', 'UPSTASH_VECTOR_REST_URL', 'UPSTASH_VECTOR_REST_TOKEN'];
const SITES = ['all', 'blog', 'world', 'zero'];
const MODES = ['chat', 'tutor', 'scholar'];
const OPERATIONS = ['search', 'overview'];
const MAX_BODY_BYTES = 8192;
const TIMEOUT_MS = 12000;
const CACHE_TTL = 60;

function requestsPerMinute() {
  const count = Number(process.env.KNOWLEDGE_REQUESTS_PER_MINUTE || 120);
  if (!Number.isInteger(count) || count < 1 || count > 10000) throw new Error('Invalid rate configuration');
  return count;
}

function getServices(signal) {
  if (!SERVICE_KEYS.every(key => String(process.env[key] || '').trim())) throw new Error('Service configuration unavailable');
  const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN, signal, retry: false });
  return {
    redis,
    minute: new Ratelimit({ redis, timeout: 1500, analytics: false, prefix: 'knowledge:minute', limiter: Ratelimit.slidingWindow(requestsPerMinute(), '60 s') }),
    index: new Index({ url: process.env.UPSTASH_VECTOR_REST_URL, token: process.env.UPSTASH_VECTOR_REST_TOKEN, signal, retry: false }),
  };
}

function readiness() {
  try {
    embeddingConfig(); requestsPerMinute();
    return SERVICE_KEYS.every(key => Boolean(String(process.env[key] || '').trim()));
  } catch { return false; }
}

function inputFrom(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body).some(key => !['operation', 'query', 'site', 'mode'].includes(key))) throw new Error('Invalid input');
  const { operation = 'search', site = 'all', mode = 'chat' } = body;
  if (!OPERATIONS.includes(operation) || !SITES.includes(site) || !MODES.includes(mode)) throw new Error('Invalid input');
  if (body.query !== undefined && typeof body.query !== 'string') throw new Error('Invalid input');
  const query = body.query?.trim() || '';
  if (query.length > 1200 || (operation === 'search' && !query)) throw new Error('Invalid input');
  return { operation, site, mode, query };
}

function clientIdentifier(req) {
  const raw = process.env.VERCEL === '1' ? req.headers['x-vercel-forwarded-for'] : req.socket?.remoteAddress;
  const ip = typeof raw === 'string' ? raw.split(',')[0].trim() : '';
  if (!isIP(ip)) throw new Error('Client address unavailable');
  return createHash('sha256').update(`knowledge:ip:${ip}`).digest('hex');
}

function sourceIdentity(source) {
  return createHash('sha256').update(JSON.stringify([source.articleId, source.articleHash, source.site, source.sourceRepository, source.sourcePath, source.title, source.url, source.section, source.text])).digest('hex').slice(0, 16);
}

export function createKnowledgeHandler(provide = getServices, provideOverview = readContentOverview) {
  return async function handler(req, res) {
    const requestId = randomUUID();
    const error = (status, code, message) => res.status(status).json({ error: message, code, requestId });
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Expose-Headers', 'Retry-After');
    if (req.method === 'OPTIONS') { res.setHeader('Access-Control-Max-Age', '600'); return res.status(204).end(); }
    if (req.method === 'GET') return res.status(200).json({ schema: 1, requestId, operations: OPERATIONS, sites: SITES, modes: MODES, generation: false, ready: readiness(), limits: { queryCharacters: 1200, timeoutMs: TIMEOUT_MS } });
    if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST, OPTIONS'); return error(405, 'METHOD_NOT_ALLOWED', '请使用 POST JSON 查询资料。'); }
    if (!/^application\/json(?:\s*;|$)/i.test(String(req.headers['content-type'] || ''))) return error(415, 'CONTENT_TYPE_INVALID', '请求需要使用 application/json。');
    let input;
    try {
      if (Number(req.headers['content-length']) > MAX_BODY_BYTES || Buffer.byteLength(JSON.stringify(req.body) || '') > MAX_BODY_BYTES) return error(413, 'BODY_TOO_LARGE', '请求内容过长。');
      input = inputFrom(req.body);
    } catch { return error(400, 'INPUT_INVALID', '请求参数不正确。'); }
    const controller = new AbortController();
    let expired = false, disconnected = false;
    const timeout = setTimeout(() => { expired = true; controller.abort(); }, TIMEOUT_MS);
    const disconnect = () => { if (!res.writableEnded) { disconnected = true; controller.abort(); } };
    res.on('close', disconnect);
    try {
      const { redis, minute, index } = provide(controller.signal);
      const result = await withinDeadline(minute.limit(clientIdentifier(req)), controller.signal);
      if (result.reason === 'timeout') throw new Error('Rate limit unavailable');
      if (!result.success) {
        const wait = Number.isFinite(result.reset) ? Math.ceil((result.reset - Date.now()) / 1000) : 60;
        res.setHeader('Retry-After', String(Math.max(1, wait)));
        return error(429, 'RATE_LIMITED', '查询过于频繁，请稍后重试。');
      }
      const fingerprint = [input, process.env.UPSTASH_VECTOR_NAMESPACE || 'launcher-v2', process.env.VECTOR_EMBEDDING_MODE || 'upstash-data', process.env.VECTOR_EMBEDDING_MODEL || '', process.env.CHAT_MIN_SCORE || '0.35'];
      const key = `knowledge:cache:v1:${createHash('sha256').update(JSON.stringify(fingerprint)).digest('hex')}`;
      let payload = await withinDeadline(redis.get(key), controller.signal);
      if (!payload || payload.operation !== input.operation || payload.query !== input.query || payload.site !== input.site || !Array.isArray(payload.sources)) {
        payload = { operation: input.operation, query: input.query, site: input.site, sources: [] };
        if (input.operation === 'overview') {
          const overview = provideOverview();
          if (typeof overview !== 'string' || Buffer.byteLength(overview) > OVERVIEW_MAX_BYTES) throw new Error('Invalid overview');
          const scope = `回答范围：${input.site}。下方是包含 BLOG、WORLD、ZERO 的完整权威快照。全站总数不能作为所选网站的总数；指定网站时，请使用“按网站来源”对应行。网站来源与内容分类是独立维度。\n\n`;
          if (Buffer.byteLength(scope + overview) > OVERVIEW_MAX_BYTES) throw new Error('Invalid overview');
          payload.overview = scope + overview;
        } else {
          const sources = await retrieveSources({ index, query: input.query, mode: input.mode, site: input.site, signal: controller.signal });
          payload.sources = sources.map(source => ({ ...source, id: sourceIdentity(source) }));
        }
        if (controller.signal.aborted) throw new Error('Request expired');
        await withinDeadline(redis.set(key, payload, { ex: CACHE_TTL }), controller.signal);
      }
      if (!controller.signal.aborted) return res.status(200).json({ schema: 1, requestId, ...payload });
    } catch {
      if (!disconnected && !res.writableEnded) return error(503, expired ? 'KNOWLEDGE_TIMEOUT' : 'KNOWLEDGE_UNAVAILABLE', '资料服务暂时不可用，请稍后重试。');
    } finally {
      clearTimeout(timeout); res.off('close', disconnect); controller.abort();
    }
  };
}

export default createKnowledgeHandler();
export const config = { maxDuration: 15 };
