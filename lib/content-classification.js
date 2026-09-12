export const ZERO_CATEGORY_NAME = '核心内容与关键信息';

const ZERO_ENTRIES = [
  { title: '金泽范式', aliases: ['金泽范式', '金泽泛式'], sources: ['金泽范式'], url: 'https://zero.sch-nie.com/core/' },
  { title: '火神契约', aliases: ['火神契约'], sources: ['火神契约'], url: 'https://zero.sch-nie.com/core/' },
  { title: '光引流辰', aliases: ['光引流辰', '光与流辰', '第九边缘协作者测试'], sources: ['光与流辰'], url: 'https://zero.sch-nie.com/SCHNIE_test/' },
  { title: '人生观', aliases: ['人生观', '人生行迹', '人生判断', '第九边缘：人生行迹'], sources: ['人生行迹'], url: 'https://zero.sch-nie.com/core/' },
  { title: '世界观', aliases: ['世界观', '宇宙观', '宇宙基础', '宇宙猜想'], sources: ['宇宙基础'], url: 'https://zero.sch-nie.com/core/' },
  { title: '自然观', aliases: ['自然观', '自然万态', '自然看法'], sources: ['自然万态'], url: 'https://zero.sch-nie.com/core/' },
];

const cleanTitle = value => String(value || '')
  .trim()
  .replace(/^灵耀体系[：:]\s*/, '')
  .replace(/^第九边缘[：:]\s*/, '');

function entryByName(value) {
  const title = cleanTitle(value);
  return ZERO_ENTRIES.find(entry => entry.aliases.some(alias => cleanTitle(alias) === title)) || null;
}

function linkedEntry(value) {
  const text = String(value || '');
  for (const match of text.matchAll(/\[([^\]\n]+)\]\(([^)\s]+)\)/g)) {
    const entry = entryByName(match[1]);
    if (entry) return entry;
  }
  return null;
}

/** Resolve author-defined ZERO entries from redirect files or exact linked overview headings. */
export function zeroEntryForMetadata(metadata = {}) {
  const sourceName = String(metadata.source || '').replaceAll('\\', '/').split('/').at(-1)?.replace(/\.mdx?$/i, '') || '';
  const direct = ZERO_ENTRIES.find(entry => entry.sources.includes(sourceName)) || entryByName(metadata.title);
  if (direct) return direct;
  const headings = [...(Array.isArray(metadata.headingPath) ? metadata.headingPath : []), metadata.entry, metadata.section];
  for (const heading of headings) {
    const entry = linkedEntry(heading);
    if (entry) return entry;
  }
  return null;
}

export function normalizeContentMetadata(metadata = {}) {
  const entry = zeroEntryForMetadata(metadata);
  if (!entry) return metadata;
  return { ...metadata, category: 'zero', categoryName: ZERO_CATEGORY_NAME, title: entry.title, url: entry.url, urlKind: 'article' };
}
