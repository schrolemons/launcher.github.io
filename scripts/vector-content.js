import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import { normalizeContentMetadata } from '../lib/content-classification.js';

export const NAMESPACE = 'launcher-v2';
export function prepareRecords(records, mode, embeddingIdentity = 'unconfigured') {
  // The embedding fingerprint prevents vectors from different models from mixing
  // while keeping all versions in the same Upstash namespace/database.
  const fingerprint = digest(String(embeddingIdentity)).slice(0, 12);
  const idMap = new Map(records.map(r => [r.id, `${mode}:${fingerprint}:${r.id}`]));
  return records.map(r => {
    const record = { id: idMap.get(r.id), data: r.data,
      metadata: { ...r.metadata, retrievalMode: mode, embeddingIdentity: String(embeddingIdentity).slice(0, 160), previousId: idMap.get(r.metadata.previousId) || '', nextId: idMap.get(r.metadata.nextId) || '' } };
    if (Buffer.byteLength(JSON.stringify(record.metadata)) > 48000) throw new Error(`元数据超过单条 48 KB 上限：${r.metadata.source}`);
    return record;
  });
}
export const categories = ['blog', 'world', 'zero'];
export const CATEGORY_NAMES = { world: '文明体系', blog: '经验分享与技术博客', zero: '核心内容与关键信息' };
export const digest = value => createHash('sha256').update(value).digest('hex');
const textValue = (v, max = 180) => String(v ?? '').slice(0, max);
const dateValue = v => v instanceof Date ? v.toISOString() : textValue(v, 60);
const listValue = v => (Array.isArray(v) ? v.flat(Infinity) : v ? [v] : []).map(v => textValue(v, 60)).slice(0, 16);

export function sourceUrl(frontmatter) {
  const base = 'https://launcher.sch-nie.com/';
  try {
    const value = frontmatter.url;
    if (!value) return { url: base, urlKind: 'launcher-home' };
    const url = new URL(String(value), base);
    if (url.protocol === 'https:' && !url.username && !url.password) return { url: url.href, urlKind: 'article' };
  } catch { /* Invalid URLs fall back to an explicitly labelled launcher entry. */ }
  return { url: base, urlKind: 'launcher-home' };
}

export function articleRecords(raw, category, relativePath) {
  raw = raw.replace(/\r\n/g, '\n');
  if (!categories.includes(category)) throw new Error(`未知分类：${category}`);
  const { data: fm, content } = matter(raw);
  const configuredCategory = String(fm.category || category).trim().toLowerCase();
  if (!categories.includes(configuredCategory)) throw new Error(`文章分类必须是 blog、world 或 zero：${relativePath}`);
  if (fm.draft === true || fm.published === false || fm.private === true || fm.password || fm.encrypted === true) return [];
  const sourceTitle = textValue(fm.title || path.basename(relativePath).replace(/\.mdx?$/i, ''), 120);
  const source = relativePath.replaceAll('\\', '/');
  const articleDefaults = normalizeContentMetadata({ category: configuredCategory, categoryName: CATEGORY_NAMES[configuredCategory], source, title: sourceTitle, ...sourceUrl(fm) });
  const cleaned = content.replace(/<!--[\s\S]*?-->/g, '').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/{%[\s\S]*?%}/g, '').replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\r/g, '');
  const sections = [];
  let headings = [], lines = [], fence = '';
  const flush = () => { if (lines.join('\n').trim()) sections.push({ section: headings.filter(Boolean).join(' / '), text: lines.join('\n').trim() }); lines = []; };
  for (const line of cleaned.split('\n')) {
    const marker = line.match(/^\s*(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = '';
      lines.push(line); continue;
    }
    const heading = !fence && line.match(/^ {0,3}(#{1,6})\s+(.+?)\s*#*$/);
    if (heading) { flush(); headings = headings.slice(0, heading[1].length - 1); headings[heading[1].length - 1] = heading[2]; }
    else lines.push(line);
  }
  flush();
  const records = [];
  for (const [sectionIndex, item] of sections.entries()) {
    const section = textValue(item.section, 220);
    const headingPath = section.split(' / ').filter(Boolean);
    const entry = textValue(item.section.split(' / ').at(-1) || articleDefaults.title, 160);
    const identity = normalizeContentMetadata({ ...articleDefaults, headingPath, entry, section });
    const effectiveCategory = identity.category;
    const title = textValue(identity.title, 120);
    const articleId = digest(`${effectiveCategory}:${source}:${title}`).slice(0, 24);
    const labels = [...listValue(fm.categories), ...listValue(fm.tags), ...listValue(fm.aliases || fm.alias)].join(' / ').slice(0, 160);
    const prefix = `${effectiveCategory.toUpperCase()} | ${title}\n${section}\n${labels ? `主题：${labels}\n` : ''}`;
    // Paragraph packing inside a heading; long paragraphs split at sentence boundaries.
    const limit = 1500 - prefix.length;
    const units = item.text.split(/\n\s*\n/).flatMap(paragraph => {
      if (paragraph.length <= limit) return [paragraph];
      return paragraph.match(/[^。！？!?\n]+[。！？!?\n]?|[。！？!?\n]/g) || [paragraph];
    });
    let buffer = '';
    const emit = () => {
      if (!buffer.trim()) return;
      const metadata = { schema: 3, pipelineVersion: '2026-09-12.1', category: effectiveCategory, categoryName: identity.categoryName,
        articleId, articleHash: digest(raw), source, title, slug: textValue(fm.slug || path.basename(relativePath).replace(/\.mdx?$/i, ''), 160),
        abbrlink: textValue(fm.abbrlink, 100), section, headingPath,
        entry, sectionIndex, sectionCount: sections.length,
        author: textValue(fm.author, 100), publishedAt: dateValue(fm.date), updatedAt: dateValue(fm.updated),
        aliases: listValue(fm.aliases || fm.alias), language: 'zh', format: /\.mdx$/i.test(relativePath) ? 'mdx' : 'markdown',
        summary: textValue(fm.description || item.text.replace(/[`#*_]/g, '').replace(/\s+/g, ' '), 240),
        summaryMethod: fm.description ? 'frontmatter-description' : 'source-excerpt',
        articleCharacters: cleaned.length, sectionCharacters: item.text.length,
        url: identity.url, urlKind: identity.urlKind,
        categories: listValue(fm.categories), tags: listValue(fm.tags), description: textValue(fm.description, 300),
        chunkIndex: records.length, text: buffer.trim() };
      const data = prefix + metadata.text;
      const hash = digest(JSON.stringify({ data, metadata }));
      records.push({ id: `${articleId}:${records.length}:${hash.slice(0, 16)}`, data, metadata: { ...metadata, hash } });
      buffer = '';
    };
    for (const unit of units) {
      let remaining = unit;
      if (buffer && buffer.length + remaining.length + 2 > limit) emit();
      while (remaining.length > limit) { buffer = remaining.slice(0, limit); emit(); remaining = remaining.slice(limit); }
      if (buffer && buffer.length + remaining.length + 2 > limit) emit();
      buffer += (buffer && !/[。！？!?]$/.test(buffer) ? '\n\n' : '') + remaining;
    }
    emit();
  }
  // Article hash and pipeline version make these relations stable for unchanged content.
  const ids = records.map(r => r.id);
  records.forEach((r, i) => {
    Object.assign(r.metadata, { chunkCount: records.length, previousId: ids[i - 1] || '', nextId: ids[i + 1] || '',
      relatedSections: sections.map(s => textValue(s.section, 220)).filter(s => s && s !== r.metadata.section).slice(0, 12),
      contentHash: digest(r.metadata.text), articleHash: digest(raw), characterCount: r.metadata.text.length });
  });
  return records;
}

export function collectRecords(root) {
  const records = [];
  let articles = 0;
  for (const folder of ['posts', ...categories]) {
    const dir = path.join(root, folder);
    if (!fs.existsSync(dir)) continue;
    const walk = (current) => {
      for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
        if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue;
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.mdx?$/i.test(entry.name)) {
          const relative = `${folder}/${path.relative(dir, full).replaceAll('\\', '/')}`;
          const result = articleRecords(fs.readFileSync(full, 'utf8'), folder === 'posts' ? 'world' : folder, relative);
          if (result.length) articles++;
          records.push(...result);
        }
      }
    };
    walk(dir);
  }
  return { records, articles };
}

export function capacityPlan(info, additions, newCount, requestEstimate = 0) {
  // Screenshot allowance, not a claim about current public pricing. Bytes are conservative estimates.
  const recordLimit = 98000, storageLimit = 700000000, requestLimit = 14000, bandwidthLimit = 35000000000;
  if (![info.vectorCount, info.indexSize, info.dimension].every(Number.isFinite)) throw new Error('无法读取容量信息，停止同步');
  const addedBytes = additions.reduce((n, r) => n + Buffer.byteLength(JSON.stringify(r)) * 2 + info.dimension * 4 + 1024, 0);
  const plan = { recordLimit, storageLimit, requestLimit, bandwidthLimit,
    peakRecords: info.vectorCount + (Number(info.pendingVectorCount) || 0) + newCount, estimatedPeakBytes: info.indexSize + addedBytes, requestEstimate, transferEstimate: addedBytes };
  if (plan.peakRecords > recordLimit || plan.estimatedPeakBytes > storageLimit || requestEstimate > requestLimit || addedBytes > bandwidthLimit) throw new Error('容量计划超过截图配额的 70%，停止同步；请检查报告和当前 Dashboard');
  return plan;
}

export function recommendations(records) {
  const seen = new Set();
  const articles = records.filter(r => {
    const key = `${r.metadata.category}:${r.metadata.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return categories.flatMap(category => articles.filter(r => r.metadata.category === category).slice(0, 6).map((r, i) => ({ category,
    question: i % 2 ? `请用初学者能理解的方式解读《${r.metadata.title}》。` : `《${r.metadata.title}》的核心设定是什么？它们如何联系起来？` })));
}
