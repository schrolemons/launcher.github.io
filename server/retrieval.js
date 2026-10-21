import { retrievalMode } from '../lib/retrieval-text.js';
import { embedTexts, embeddingMode } from './embedding.js';
import { normalizeContentMetadata, zeroEntryForMetadata } from '../lib/content-classification.js';

// 来源数量随交流模式变化：考据需要更多证据，畅聊只需少量要点。
const SOURCE_CAPS = { chat: 4, tutor: 6, scholar: 10 };

// 解读性文章（如《木缘桑庭》）里常用「#### [文章名](链接)」这样的标题概括介绍其它文章。
// 被选中的文本块此时实际属于被介绍的那篇文章，来源标题和链接应指向被介绍的文章，而不是解读性文章本身。
function introducedArticle(m) {
  const zeroEntry = zeroEntryForMetadata(m);
  if (zeroEntry) return { title: zeroEntry.title, url: zeroEntry.url };
  const headings = [...(Array.isArray(m?.headingPath) ? m.headingPath : []), m?.entry, m?.section].filter(v => typeof v === 'string' && v);
  for (const heading of headings) {
    const match = heading.match(/\[([^\]\n]+)\]\(([^)\s]+)\)/);
    if (match) return { title: match[1].trim(), url: match[2].trim() };
  }
  return null;
}

export function selectSources(results, category, question = '', mode = 'chat', site = 'all') {
  const cap = SOURCE_CAPS[mode] ?? SOURCE_CAPS.chat;
  const counts = new Map(), seen = new Set();
  let length = 0;
  const ordered = results.map(result => ({ ...result, metadata: normalizeContentMetadata(result.metadata) })).sort((a, b) => {
    const named = r => [r.metadata?.title, introducedArticle(r.metadata)?.title, r.metadata?.entry, ...(r.metadata?.aliases || [])]
      .some(v => typeof v === 'string' && v.length > 1 && question.normalize('NFKC').includes(v.normalize('NFKC')));
    return Number(named(b)) - Number(named(a)) || (Number(b.score) || 0) - (Number(a.score) || 0);
  });
  return ordered.filter(r => {
    const m = r.metadata;
    if (!m || m.schema !== 3 || !['blog', 'world', 'zero'].includes(m.category) || (category !== 'all' && m.category !== category)) return false;
    if (site !== 'all' && m.site !== site) return false;
    const minScore = Number(process.env.CHAT_MIN_SCORE || 0.35);
    if (m.retrievalMode !== retrievalMode()) return false;
    if (!Number.isFinite(minScore) || typeof r.score !== 'number' || r.score < minScore) return false;
    if (typeof m.text !== 'string' || !m.text || seen.has(m.text) || (counts.get(m.articleId) || 0) >= 3 || length + m.text.length > 6000) return false;
    seen.add(m.text); counts.set(m.articleId, (counts.get(m.articleId) || 0) + 1); length += m.text.length;
    return true;
  }).slice(0, cap).map((r, i) => {
    const m = r.metadata;
    const introduced = introducedArticle(m);
    let url = 'https://launcher.sch-nie.com/', urlKind = 'launcher-home', title = String(m.title).slice(0, 120);
    if (introduced) {
      title = introduced.title.slice(0, 120);
      try { const parsed = new URL(introduced.url); if (parsed.protocol === 'https:' && !parsed.username && !parsed.password && parsed.hostname) { url = parsed.href; urlKind = 'article'; } } catch {}
    } else {
      try { const parsed = new URL(m.url); if (parsed.protocol === 'https:' && !parsed.username && !parsed.password && parsed.hostname) { url = parsed.href; urlKind = ['launcher-home', 'site-home'].includes(m.urlKind) ? m.urlKind : 'article'; } } catch {}
    }
    return { number: i + 1, title, section: String(m.section || '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').slice(0, 220), category: m.category, categoryName: String(m.categoryName || m.category).slice(0, 80), url, urlKind,
      site: String(m.site || ''), siteName: String(m.siteName || ''), sourcePath: String(m.sourcePath || m.source || ''), sourceRepository: String(m.sourceRepository || ''), contentStats: m.contentStats,
      author: String(m.author || '').slice(0, 100), updatedAt: String(m.updatedAt || '').slice(0, 60),
      // 同一篇文章的所有文本块共享同一个 articleId，模型据此判断哪些信息来自同一来源。
      articleId: String(m.articleId || '').slice(0, 48), articleHash: String(m.articleHash || '').slice(0, 48),
      categories: Array.isArray(m.categories) ? m.categories.slice(0, 8).map(v => String(v).slice(0, 60)) : [],
      summary: String(m.summary || '').slice(0, 240), text: m.text };
  });
}


export function withinDeadline(promise, signal) {
  return new Promise((resolve, reject) => {
    const aborted = () => { cleanup(); reject(new Error('Request expired')); };
    const cleanup = () => signal.removeEventListener('abort', aborted);
    if (signal.aborted) return aborted();
    signal.addEventListener('abort', aborted, { once: true });
    Promise.resolve(promise).then(value => { cleanup(); resolve(value); }, error => { cleanup(); reject(error); });
  });
}

/** Shared bounded retrieval; category is semantic, site is the physical website. */
export async function retrieveSources({ index, query, question = query, category = 'all', mode = 'chat', site = 'all', signal, onPhase = () => {} }) {
  if (signal.aborted) throw new Error('Request expired');
  const retrieval = retrievalMode();
  const namespace = process.env.UPSTASH_VECTOR_NAMESPACE || 'launcher-v2';
  const queryPayload = embeddingMode() === 'external'
    ? { vector: (await withinDeadline(embedTexts([query], (url, options) => fetch(url, { ...options, signal })), signal))[0] }
    : { data: query };
  onPhase('检索向量资料');
  const results = await withinDeadline(index.query({ ...queryPayload, topK: 16, includeMetadata: true,
    filter: `schema = 3 AND retrievalMode = '${retrieval}'${category === 'all' ? '' : ` AND category = '${category}'`}${site === 'all' ? '' : ` AND site = '${site}'`}`,
  }, { namespace }), signal);
  onPhase('补取相邻资料');
  const eligible = results.filter(r => r.score >= .35 && r.metadata?.schema === 3 && r.metadata?.retrievalMode === retrieval && (category === 'all' || r.metadata?.category === category) && (site === 'all' || r.metadata?.site === site)).slice(0, 2);
  const neighborIds = [...new Set(eligible.flatMap(r => [r.metadata.previousId, r.metadata.nextId]).filter(Boolean))].slice(0, 4);
  let neighbors = [];
  if (neighborIds.length) {
    const fetched = await withinDeadline(index.fetch(neighborIds, { namespace, includeMetadata: true }), signal);
    neighbors = fetched.filter(Boolean).flatMap(r => {
      const parent = eligible.find(p => p.metadata.articleId === r.metadata?.articleId && p.metadata.articleHash === r.metadata?.articleHash && p.metadata.section === r.metadata?.section);
      return parent ? [{ ...r, score: parent.score - .03 }] : [];
    });
  }
  return selectSources([...results, ...neighbors], category, question, mode, site);
}
