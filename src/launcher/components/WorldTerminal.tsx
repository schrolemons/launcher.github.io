import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import suggestions from '../generated/chat-suggestions.json';
import { readTerminalStream, type Source } from '../terminal-stream';
import { parseTerminalOutput, type TerminalControl } from '../terminal-control';
import ChatMarkdown from './ChatMarkdown';
import '../world-terminal.css';

type Message = { role: 'user' | 'assistant'; content: string; sources?: Source[]; control?: TerminalControl; complete?: boolean };
const articleHosts = new Set(['blog.sch-nie.com', 'world.sch-nie.com', 'zero.sch-nie.com']);
const categoryCopy = {
  all: { eyebrow: 'SCHNIE', label: '三类资料', short: '三类资料' },
  blog: { eyebrow: 'BLOG', label: 'BLOG · 第九边缘博客', short: 'BLOG' },
  world: { eyebrow: 'WORLD', label: 'WORLD · 第九边缘世界', short: 'WORLD' },
  zero: { eyebrow: 'ZERO', label: 'ZERO · 第九边缘元点', short: 'ZERO' },
} as const;
const modeCopy = {
  chat: { tag: 'CHAT WITH AI', title: '从资料出发，找到新的联系。', description: (scope: string) => scope === '三类资料' ? '我会在 BLOG、WORLD、ZERO 三类资料中查找，再自然地和你聊下去；ARK 与 WORLD 是同一世界档案的不同呈现入口。' : `我会先查阅${scope}的内容，再自然地和你聊下去。`, placeholder: (scope: string) => `问问${scope}里的内容…`, promptLabel: '试着问我' },
  tutor: { tag: 'EXPLAINER', title: '把复杂内容讲得更容易懂。', description: (scope: string) => `我会把${scope}里的概念拆开，按你的节奏一步步解释。`, placeholder: (scope: string) => `请让我解释${scope}里的一个概念…`, promptLabel: '从这里开始' },
  scholar: { tag: 'RESEARCH', title: '沿着来源，核对每一层细节。', description: (scope: string) => `我会优先核对${scope}的资料，区分原文、推断和仍待确认的部分。`, placeholder: (scope: string) => `请帮我考据${scope}里的一个设定…`, promptLabel: '开始考据' },
} as const;
type TerminalErrorInfo = { message: string; code?: string; phase?: string; requestId?: string; status?: number; hint?: string };
class TerminalRequestError extends Error {
  info: TerminalErrorInfo;
  constructor(info: TerminalErrorInfo) { super(info.message); this.info = info; }
}
export default function WorldTerminal({ mobile = false, accent = '#e7ee72', onOpenChange }: { mobile?: boolean; accent?: string; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false), [input, setInput] = useState('');
  const [category, setCategory] = useState('all'), [mode, setMode] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([]), [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string; phase?: string; requestId?: string; status?: number; hint?: string } | null>(null), [notice, setNotice] = useState(''), [tip, setTip] = useState(0);
  const [visitorName, setVisitorName] = useState('访客'), [nameDraft, setNameDraft] = useState(''), [editingSpeaker, setEditingSpeaker] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement>(null), editor = useRef<HTMLTextAreaElement>(null);
  const scroll = useRef<HTMLDivElement>(null), controller = useRef<AbortController | null>(null), stick = useRef(true);
  const busyRef = useRef(false);
  const scope = categoryCopy[category as keyof typeof categoryCopy];
  const options = suggestions.filter(s => category === 'all' || s.category === category);
  const prompts = options.length ? options : [{ category, question: `你能怎样帮我理解${scope.label}的内容？` }];
  const suggested = prompts[tip % prompts.length].question;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => { if (!document.hidden) setTip(t => t + 1); }, 8500);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (open) { dialog.current?.showModal(); editor.current?.focus({ preventScroll: true }); }
    onOpenChange?.(open);
  }, [open, onOpenChange]);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (stick.current && scroll.current) scroll.current.scrollTop = scroll.current.scrollHeight;
  }, [messages, busy, error]);
  function close() { controller.current?.abort(); setOpen(false); trigger.current?.focus(); }
  function beginNameEdit(index: number) { setNameDraft(visitorName); setEditingSpeaker(index); }
  function commitName() { const nextName = nameDraft.trim().slice(0, 20); if (nextName) setVisitorName(nextName); setEditingSpeaker(null); }
  function reset(nextCategory = category, nextMode = mode) {
    controller.current?.abort(); setMessages([]); setError(null); setNotice(''); setCategory(nextCategory); setMode(nextMode); setTip(0);
  }
  async function send(question = input, retry = false) {
    if (busyRef.current || !question.trim() || question.length > 1200) return;
    const previous = retry ? messages.slice(0, -2) : messages;
    // Only complete pairs enter the next request; a stopped answer cannot become trusted history.
    const history: Message[] = [];
    for (let i = 0; i + 1 < previous.length; i += 2) {
      if (previous[i].role === 'user' && previous[i + 1].complete) history.push(previous[i], previous[i + 1]);
    }
    while (history.length > 8 || history.reduce((n, m) => n + m.content.length, question.length) > 6000) history.splice(0, 2);
    const requestMessages = [...history.map(({ role, content }) => ({ role, content })), { role: 'user', content: question.trim() }];
    const next: Message[] = [...previous, { role: 'user', content: question.trim() }, { role: 'assistant', content: '' }];
    setMessages(next); setInput(''); setError(null); setNotice(''); setBusy(true); busyRef.current = true; stick.current = true;
    const abort = new AbortController(); controller.current = abort;
    const timer = window.setTimeout(() => abort.abort('timeout'), 35000);
    let answer = '', sources: Source[] = [], phase = '连接对话接口';
    const update = (complete = false) => {
      const parsed = parseTerminalOutput(answer);
      setMessages([...next.slice(0, -1), { role: 'assistant', content: parsed.content, sources, control: parsed.control, complete }]);
    };
    try {
      phase = '连接对话接口';
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: requestMessages, category, mode }), signal: abort.signal });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new TerminalRequestError({ message: payload.error || `接口返回 HTTP ${response.status}`, ...payload, status: response.status });
      }
      if (!response.body) throw new Error('浏览器未收到响应流');
      phase = '读取流式回答';
      await readTerminalStream(response.body, event => {
        if (event.type === 'text') { answer += event.value; if (answer.length > 12000) throw new Error('回答过长，已停止'); update(); }
        if (event.type === 'sources') { sources = event.value; update(); }
        if (event.type === 'length') setNotice('本次回答达到长度上限，你可以继续追问。');
      });
      if (!answer.trim()) throw new Error('未收到有效回答，请重试');
      update(true);
    } catch (e) {
      update(false);
      const fallback: TerminalErrorInfo = abort.signal.aborted
        ? { message: abort.signal.reason === 'timeout' ? '连接超时，请重试' : '已停止生成，可重试或提出新问题', code: 'REQUEST_ABORTED' }
        : { message: e instanceof Error ? e.message : '连接失败，请重试', code: 'CLIENT_ERROR' };
      const info = e instanceof TerminalRequestError ? e.info : fallback;
      setError({ ...info, phase: info.phase || phase });
    } finally { window.clearTimeout(timer); setBusy(false); busyRef.current = false; controller.current = null; }
  }
  const retryQuestion = messages.at(-2)?.role === 'user' ? messages.at(-2)!.content : '';
  const copy = modeCopy[mode as keyof typeof modeCopy];
  const eyebrow = `${scope.eyebrow} / ${copy.tag}`;
  const description = copy.description(scope.label);
  const placeholder = copy.placeholder(scope.short);
  const modeLabel = mode === 'chat' ? '轻松畅聊' : mode === 'tutor' ? '耐心讲解' : '资料考据';
  const lastAssistant = [...messages].reverse().find(message => message.role === 'assistant');
  const sourceCount = lastAssistant?.sources?.length || 0;
  const fallbackTrust = error ? 0 : busy ? 48 : !messages.length ? 72 : lastAssistant?.complete ? Math.min(96, 54 + sourceCount * 7) : 36;
  const trust = error ? 0 : lastAssistant?.control?.trust ?? fallbackTrust;
  const fallbackAffinity = error ? 0 : !messages.length ? 55 : lastAssistant?.complete ? 58 : 45;
  const affinity = error ? 0 : lastAssistant?.control?.affinity ?? fallbackAffinity;
  const status = error ? '连接异常' : lastAssistant?.control?.label || (busy ? '检索与生成' : messages.length ? '已完成' : '待机');
  const mood = lastAssistant?.control?.mood;
  const modal = open && <dialog ref={dialog} className={`world-terminal world-terminal--${mode} ${mobile ? 'world-terminal--mobile' : ''}`} aria-labelledby={mobile ? 'mobile-terminal-title' : 'terminal-title'}
    style={{ '--terminal-accent': accent } as CSSProperties} onCancel={e => { e.preventDefault(); close(); }} onClose={close}
    onClick={e => { if (e.target === e.currentTarget) { const box = e.currentTarget.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) close(); } }}>
    <div className="world-terminal__shell">
      <header className="world-terminal__header">
        <div><span className="world-terminal__eyebrow">{eyebrow}</span><h2 id={mobile ? 'mobile-terminal-title' : 'terminal-title'}>SCHNIE: CHAT WITH AI</h2></div>
        <button type="button" className="world-terminal__close" onClick={close} aria-label="关闭世界终端">×</button>
      </header>
      <div className="world-terminal__settings">
        <label>内容分类<select aria-label="内容分类" value={category} disabled={busy} onChange={e => reset(e.target.value, mode)}>
          <option value="all">全部资料</option><option value="blog">BLOG · 博客</option><option value="world">WORLD · 世界</option><option value="zero">ZERO · 元点</option>
        </select></label>
        <label>交流模式<select aria-label="交流模式" value={mode} disabled={busy} onChange={e => reset(category, e.target.value)}>
          <option value="chat">轻松畅聊</option><option value="tutor">耐心讲解</option><option value="scholar">资料考据</option>
        </select></label>
        <button type="button" disabled={busy || !messages.length} onClick={() => reset()}>新对话 ↗</button>
        <p className="world-terminal__scope-note">ARK 与 WORLD 共用世界档案，AI 按 BLOG / WORLD / ZERO 三类资料分区检索。</p>
      </div>
      <div className="world-terminal__statusbar" aria-label="终端状态">
        <div className={`world-terminal__status world-terminal__status--${error ? 'error' : busy ? 'busy' : 'ready'}`} title={mood ? `模型状态：${mood}` : undefined}><span className="world-terminal__status-dot" aria-hidden="true" /> <span>AI 状态</span><strong>{status}</strong>{mood && <small className="world-terminal__mood">{mood}</small>}</div>
        <div className="world-terminal__status"><span>模式</span><strong>{modeLabel}</strong></div>
        <div className="world-terminal__status"><span>来源</span><strong>{sourceCount ? `${sourceCount} 条` : '待检索'}</strong></div>
        <div className="world-terminal__trust" title="模型可根据证据、推断边界和回答完整度调整本次回答的可信度；缺少状态时使用保守估算"><span>回答可信度</span><div className="world-terminal__meter" role="meter" aria-label="回答可信度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={trust}><i style={{ width: `${trust}%` }} /></div><strong>{trust}%</strong></div>
        <div className="world-terminal__affinity" title="模型可根据本轮交流的态度调整好感度，并据此改变语气"><span>好感度</span><div className="world-terminal__meter" role="meter" aria-label="好感度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={affinity}><i style={{ width: `${affinity}%` }} /></div><strong>{affinity}%</strong></div>
      </div>
      <div className="world-terminal__thread" ref={scroll} onScroll={() => { const el = scroll.current; if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90; }}>
        {!messages.length && <section className="world-terminal__welcome">
          <p className="world-terminal__eyebrow">{eyebrow}</p>
          <h3>{copy.title}</h3>
          <p>{description}</p>
          <button type="button" className="world-terminal__suggestion" onClick={() => { setInput(suggested); editor.current?.focus(); }}><span>{copy.promptLabel}</span><strong key={`${mode}-${suggested}`}>{suggested}</strong><span aria-hidden="true">↗</span></button>
        </section>}
        {messages.map((message, i) => <article className={`world-terminal__message world-terminal__message--${message.role}`} key={i}>
          <div className="world-terminal__speaker">{message.role === 'user' ? (editingSpeaker === i ? <form className="world-terminal__name-editor" onSubmit={e => { e.preventDefault(); commitName(); }}><span>YOU /</span><input autoFocus value={nameDraft} maxLength={20} aria-label="临时昵称" onChange={e => setNameDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setEditingSpeaker(null); }} /><button type="submit">保存</button></form> : <button type="button" className="world-terminal__speaker-button" onClick={() => beginNameEdit(i)} aria-label="修改临时昵称">YOU / {visitorName}</button>) : '09 / 世界终端'}{message.role === 'assistant' && !message.complete && message.content && !busy ? ' · 未完成' : ''}</div>
          <div className="world-terminal__text">{message.content ? (message.role === 'assistant' ? <ChatMarkdown content={message.content} /> : message.content) : (busy ? '正在检索资料，组织回答…' : '')}</div>
          {!!message.sources?.length && <details className="world-terminal__sources"><summary>参考资料 · {message.sources.length}</summary>{message.sources.map(source => {
            let safe = false;
            try { const u = new URL(source.url); safe = /^https:$/.test(u.protocol) && ['blog.sch-nie.com', 'world.sch-nie.com', 'zero.sch-nie.com'].includes(u.hostname); } catch {}
            return safe && <a href={source.url} target="_blank" rel="noopener noreferrer" key={source.number}><span>[{source.number}] {source.category.toUpperCase()}</span> {source.title}<small>{source.section}{source.urlKind === 'site' ? ' · 分类入口（未提供文章直链）' : ' · 阅读原文'} ↗</small></a>;
          })}</details>}
          {message.role === 'assistant' && !!message.sources?.length && <div className="world-terminal__article-links">{message.sources.filter(source => source.urlKind === 'article' && (() => { try { const u = new URL(source.url); return u.protocol === 'https:' && articleHosts.has(u.hostname); } catch { return false; } })()).slice(0, 3).map(source => <a href={source.url} target="_blank" rel="noopener noreferrer" key={`article-${source.number}`}>阅读《{source.title}》 ↗</a>)}</div>}
        </article>)}
      </div>
      <div className="world-terminal__feedback" aria-live="polite">
        {error && <div className="world-terminal__error" role="alert"><p><strong>{error.message}</strong>{error.status ? ` · HTTP ${error.status}` : ''}</p><p className="world-terminal__error-meta">阶段：{error.phase || '未知'}{error.code ? ` · ${error.code}` : ''}{error.requestId ? ` · 请求 ${error.requestId}` : ''}</p>{error.hint && <p className="world-terminal__error-hint">建议：{error.hint}</p>}{retryQuestion && !busy && <button type="button" onClick={() => send(retryQuestion, true)}>重试上次问题</button>}</div>}
        {notice && <p>{notice}</p>}
        {busy && <p role="status">终端正在回应…</p>}
      </div>
      <form className="world-terminal__composer" onSubmit={e => { e.preventDefault(); void send(); }}>
        <textarea ref={editor} value={input} onChange={e => setInput(e.target.value)} maxLength={1200} rows={2} aria-label="输入你的问题" placeholder={placeholder} disabled={busy}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && !mobile) { e.preventDefault(); void send(); } }} />
        <div className="world-terminal__compose-bottom"><span>{input.length} / 1200 <span className="world-terminal__keyhint"> · Shift + Enter 换行</span></span>
          {busy ? <button type="button" onClick={() => controller.current?.abort()}>停止生成 ■</button> : <button type="submit" disabled={!input.trim()} aria-label="发送问题">发送 ↗</button>}
        </div>
      </form>
      <footer className="world-terminal__footer">回答由 AI 生成，请结合来源判断 · 切换范围或模式会开启新对话</footer>
    </div>
  </dialog>;
  return <>
    <button ref={trigger} type="button" className={`terminal-trigger ${mobile ? 'terminal-trigger--mobile' : ''}`} onClick={() => setOpen(true)} aria-label="打开世界终端对话入口" aria-haspopup="dialog">
      <span className="terminal-trigger__label">打开对话</span><span className="terminal-trigger__hint">Ask the archive</span><span className="terminal-trigger__arrow" aria-hidden="true">↗</span>
    </button>
    {typeof document !== 'undefined' && modal && createPortal(modal, document.body)}
  </>;
}
