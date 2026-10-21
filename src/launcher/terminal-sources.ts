import type { Source } from './terminal-stream';

export type CitedSource = Source & { numbers: number[] };

/** Candidate retrieval results become references only through citations in prose. */
export function citedSources(sources: Source[] = [], content = ''): CitedSource[] {
  let fence = '';
  const prose = content.split('\n').filter(line => {
    const marker = line.trim().match(/^(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = '';
      return false;
    }
    return !fence && !/^\s*\[\d+\]:/.test(line);
  }).join('\n').replace(/(`+)[\s\S]*?\1/g, '').replace(/\[[^\]\n]+\]\([^\s)]+\)/g, '');
  const cited = new Set([...prose.matchAll(/［(\d{1,3})］|\[(\d{1,3})\](?!\()/g)].map(m => Number(m[1] || m[2])));
  const articles = new Map<string, CitedSource>();
  for (const source of sources) {
    if (!cited.has(source.number)) continue;
    try {
      const url = new URL(source.url);
      if (url.protocol !== 'https:' || url.username || url.password || !url.hostname) continue;
    } catch { continue; }
    // Different concepts may share an index URL; titles keep their identities separate.
    const key = `${source.url}\n${source.title}`;
    const existing = articles.get(key);
    if (existing) { if (!existing.numbers.includes(source.number)) existing.numbers.push(source.number); }
    else articles.set(key, { ...source, numbers: [source.number] });
  }
  return [...articles.values()];
}
