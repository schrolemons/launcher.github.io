export type TerminalMood = 'calm' | 'curious' | 'cautious' | 'focused' | 'playful';
export type TerminalControl = { trust?: number; affinity?: number; mood?: TerminalMood; label?: string; sources?: 'show' | 'none'; recommend?: string[] };

const statusLine = /^[ \t]*%status\s+([^%\r\n]+)%[ \t]*(?:\r?\n|$)/gimu;
const recommendLine = /^[ \t]*%recommend\s+([^%\r\n]+)%[ \t]*(?:\r?\n|$)/gimu;
const moods = new Set<TerminalMood>(['calm', 'curious', 'cautious', 'focused', 'playful']);

function cleanLabel(value: string | undefined) {
  const label = value?.trim().replace(/[<>]/g, '').slice(0, 12);
  return label || undefined;
}

// 模型用 JSON 数组返回推荐关键词；空数组表示「明确不推荐」，无字段或无法解析时返回 undefined 以便前端回退。
function cleanRecommend(value: string | undefined): string[] | undefined {
  if (value === undefined) return undefined;
  let parsed;
  try {
    parsed = JSON.parse(value.replace(/[\u201C\u201D\uFF02]/g, '"').replace(/\uFF0C/g, ',').trim());
  } catch { return undefined; }
  if (!Array.isArray(parsed)) return undefined;
  return parsed.filter(item => typeof item === 'string')
    .map(item => item.normalize('NFKC').replace(/[<>]/g, '').trim().slice(0, 40))
    .filter(item => item.length > 0)
    .slice(0, 6);
}

/** Remove optional model-to-UI control lines while retaining bounded, safe state. */
export function parseTerminalOutput(content: string): { content: string; control: TerminalControl } {
  let control: TerminalControl = {};
  const visible = content.replace(recommendLine, (_line, raw: string) => {
    const recommend = cleanRecommend(raw);
    if (recommend !== undefined) control.recommend = recommend;
    return '';
  }).replace(statusLine, (_line, params: string) => {
    const trust = params.match(/(?:^|\s)trust\s*=\s*(\d{1,3})(?=\s|$)/iu)?.[1];
    const affinity = params.match(/(?:^|\s)affinity\s*=\s*(\d{1,3})(?=\s|$)/iu)?.[1];
    const mood = params.match(/(?:^|\s)mood\s*=\s*([a-z-]+)(?=\s|$)/iu)?.[1]?.toLowerCase() as TerminalMood | undefined;
    const label = params.match(/(?:^|\s)label\s*=\s*([^\s]+)/iu)?.[1];
    const sources = params.match(/(?:^|\s)sources\s*=\s*(show|none)(?=\s|$)/iu)?.[1]?.toLowerCase() as 'show' | 'none' | undefined;
    if (trust !== undefined) control.trust = Math.max(0, Math.min(100, Number(trust)));
    if (affinity !== undefined) control.affinity = Math.max(0, Math.min(100, Number(affinity)));
    if (mood && moods.has(mood)) control.mood = mood;
    if (label) control.label = cleanLabel(label);
    if (sources === 'show' || sources === 'none') control.sources = sources;
    return '';
  }).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  return { content: visible, control };
}
