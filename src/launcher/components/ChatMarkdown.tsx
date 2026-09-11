import type { ReactNode } from 'react';

const safeUrl = (value: string) => {
  try {
    const url = new URL(value, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
};

function inline(text: string): ReactNode[] {
  const token = /(\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\[[^\]]+\]\([^\s)]+\)|~~[^~]+~~|==[^=]+==|\*[^*]+\*|_[^_]+_)/g;
  const nodes: ReactNode[] = [];
  let last = 0, index = 0, match: RegExpExecArray | null;
  while ((match = token.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const value = match[0], key = `inline-${index++}`;
    if (value.startsWith('**') || value.startsWith('__')) nodes.push(<strong key={key}>{value.slice(2, -2)}</strong>);
    else if (value.startsWith('~~')) nodes.push(<del key={key}>{value.slice(2, -2)}</del>);
    else if (value.startsWith('==')) nodes.push(<mark key={key}>{value.slice(2, -2)}</mark>);
    else if (value.startsWith('`')) nodes.push(<code key={key}>{value.slice(1, -1)}</code>);
    else if (value.startsWith('[')) {
      const link = value.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
      const href = link && safeUrl(link[2]);
      nodes.push(href ? <a key={key} href={href} target="_blank" rel="noopener noreferrer">{link[1]}</a> : link?.[1] || value);
    } else if (value.startsWith('*') || value.startsWith('_')) nodes.push(<em key={key}>{value.slice(1, -1)}</em>);
    last = match.index + value.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

function table(lines: string[], key: string) {
  const rows = lines.map(line => line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()));
  const head = rows[0], body = rows.slice(2);
  return <div className="chat-markdown__table-wrap" key={key}><table><thead><tr>{head.map((cell, i) => <th key={i}>{inline(cell)}</th>)}</tr></thead><tbody>{body.map((row, i) => <tr key={i}>{head.map((_, j) => <td key={j}>{inline(row[j] || '')}</td>)}</tr>)}</tbody></table></div>;
}

const isAsciiFrame = (line: string) => /^\s*\*#{5,}\*?\s*$/.test(line);

export default function ChatMarkdown({ content }: { content: string }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: ReactNode[] = [], paragraph: string[] = [], list: string[] = [];
  let blockIndex = 0, fence = '', code: string[] = [], note: { tone: string; lines: string[] } | null = null;
  const flushParagraph = () => { if (paragraph.length) { blocks.push(<p key={`p-${blockIndex++}`}>{paragraph.flatMap((line, i) => i ? [<br key={`br-${i}`} />, ...inline(line)] : inline(line))}</p>); paragraph.length = 0; } };
  const flushList = () => { if (list.length) { blocks.push(<ul key={`ul-${blockIndex++}`}>{list.map((item, i) => <li key={i}>{inline(item)}</li>)}</ul>); list.length = 0; } };
  const flushCode = () => { if (code.length) { blocks.push(<pre key={`code-${blockIndex++}`}><code>{code.join('\n')}</code></pre>); code = []; } };
  const flushNote = () => { if (note) { blocks.push(<aside className={`chat-markdown__note chat-markdown__note--${note.tone}`} key={`note-${blockIndex++}`}><span>{note.tone}</span><div>{<ChatMarkdown content={note.lines.join('\n')} />}</div></aside>); note = null; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (note) { if (/^%endnote%\s*$/i.test(line.trim())) flushNote(); else note.lines.push(line); continue; }
    const noteStart = line.trim().match(/^%note\s+([a-z0-9_-]+)%\s*(.*)$/i);
    if (noteStart) { flushParagraph(); flushList(); note = { tone: noteStart[1].toLowerCase(), lines: noteStart[2] ? [noteStart[2]] : [] }; continue; }
    if (fence) { if (line.trim().startsWith(fence)) { flushCode(); fence = ''; } else code.push(line); continue; }
    const fenceStart = line.trim().match(/^(`{3,}|~{3,})\s*\w*$/);
    if (fenceStart) { flushParagraph(); flushList(); fence = fenceStart[1]; continue; }
    if (isAsciiFrame(line)) {
      flushParagraph(); flushList();
      const art = [line];
      while (i + 1 < lines.length && art.length < 12) {
        art.push(lines[++i]);
        if (isAsciiFrame(art.at(-1)!)) break;
      }
      blocks.push(<pre className="chat-markdown__ascii" key={`ascii-${blockIndex++}`}><code>{art.join('\n')}</code></pre>);
      continue;
    }
    const heading = line.match(/^\s*(#{1,4})\s+(.+?)\s*#*$/);
    if (heading) { flushParagraph(); flushList(); const Tag = `h${heading[1].length}` as keyof JSX.IntrinsicElements; blocks.push(<Tag key={`h-${blockIndex++}`}>{inline(heading[2])}</Tag>); continue; }
    if (/^\s*[-*+]\s+/.test(line)) { flushParagraph(); list.push(line.replace(/^\s*[-*+]\s+/, '')); continue; }
    if (/^\s*\d+[.)]\s+/.test(line)) { flushParagraph(); list.push(line.replace(/^\s*\d+[.)]\s+/, '')); continue; }
    if (/^\s*>/.test(line)) { flushParagraph(); flushList(); blocks.push(<blockquote key={`q-${blockIndex++}`}>{inline(line.replace(/^\s*>\s?/, ''))}</blockquote>); continue; }
    if (/^\s*\|.*\|\s*$/.test(line) && /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[i + 1] || '')) {
      flushParagraph(); flushList(); const rows = [line, lines[++i]]; while (/^\s*\|.*\|\s*$/.test(lines[i + 1] || '') && !/^\s*\|?\s*:?-{3,}/.test(lines[i + 1])) rows.push(lines[++i]); blocks.push(table(rows, `table-${blockIndex++}`)); continue;
    }
    if (!line.trim()) { flushParagraph(); flushList(); continue; }
    paragraph.push(line);
  }
  flushParagraph(); flushList(); flushCode(); flushNote();
  return <div className="chat-markdown">{blocks}</div>;
}
