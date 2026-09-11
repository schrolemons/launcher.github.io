export type TerminalMood = 'calm' | 'curious' | 'cautious' | 'focused' | 'playful';
export type TerminalControl = { trust?: number; affinity?: number; mood?: TerminalMood; label?: string; sources?: 'show' | 'none' };

const statusLine = /^[ \t]*%status\s+([^%\r\n]+)%[ \t]*(?:\r?\n|$)/gimu;
const moods = new Set<TerminalMood>(['calm', 'curious', 'cautious', 'focused', 'playful']);

function cleanLabel(value: string | undefined) {
  const label = value?.trim().replace(/[<>]/g, '').slice(0, 12);
  return label || undefined;
}

/** Remove optional model-to-UI control lines while retaining bounded, safe state. */
export function parseTerminalOutput(content: string): { content: string; control: TerminalControl } {
  let control: TerminalControl = {};
  const visible = content.replace(statusLine, (_line, params: string) => {
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
