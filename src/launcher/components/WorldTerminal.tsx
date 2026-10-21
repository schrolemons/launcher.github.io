import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { readTerminalStream, type Source } from '../terminal-stream';
import { parseTerminalOutput, type TerminalControl } from '../terminal-control';
import { citedSources } from '../terminal-sources';
import suggestions from '../generated/chat-suggestions.json';
import ChatMarkdown from './ChatMarkdown';
import LauncherIcon from './LauncherIcon';
import TerminalSelect from './TerminalSelect';
import TerminalStatus from './TerminalStatus';
import { TurnstileController } from '../turnstile';
import '../world-terminal.css';

const LLM_CONFIG_KEY = 'sch-nie:llm-config';
const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY?.trim() || '';
type ModelConfig = {
  apiKey: string; baseUrl: string; model: string; context_limit: string;
  temperature: string; top_p: string; top_k: string; presence_penalty: string; frequency_penalty: string; max_tokens: string;
};
const SAMPLING_FIELDS = ['temperature', 'top_p', 'top_k', 'presence_penalty', 'frequency_penalty', 'max_tokens'] as const;
const CONTEXT_LIMIT_DEFAULT = 6000;
const CONTEXT_LIMIT_MIN = 1200;
const CONTEXT_LIMIT_MAX = 16000;
const SAMPLING_CONTROLS: readonly { key: typeof SAMPLING_FIELDS[number]; label: string; min: number; max: number; step: number; hint?: string }[] = [
  { key: 'temperature', label: '温度 temperature', min: 0, max: 2, step: 0.05 },
  { key: 'top_p', label: 'Top-P', min: 0, max: 1, step: 0.05 },
  { key: 'top_k', label: 'Top-K', min: 1, max: 200, step: 1, hint: '仅部分模型支持' },
  { key: 'presence_penalty', label: '存在惩罚', min: -2, max: 2, step: 0.1 },
  { key: 'frequency_penalty', label: '频率惩罚', min: -2, max: 2, step: 0.1 },
  { key: 'max_tokens', label: '输出上限 max_tokens', min: 1, max: 8192, step: 1 },
];
const defaultModelConfig = (): ModelConfig => ({ apiKey: '', baseUrl: '', model: '', context_limit: '', temperature: '', top_p: '', top_k: '', presence_penalty: '', frequency_penalty: '', max_tokens: '' });
function loadModelConfig(): ModelConfig {
  try {
    if (typeof localStorage === 'undefined') return defaultModelConfig();
    const raw = localStorage.getItem(LLM_CONFIG_KEY);
    if (raw) {
      const value = JSON.parse(raw);
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const str = (key: string) => typeof value[key] === 'string' ? value[key] : '';
        const config = { apiKey: '', baseUrl: str('baseUrl'), model: str('model'), context_limit: str('context_limit'), temperature: str('temperature'), top_p: str('top_p'), top_k: str('top_k'), presence_penalty: str('presence_penalty'), frequency_penalty: str('frequency_penalty'), max_tokens: str('max_tokens') };
        if (str('apiKey')) localStorage.setItem(LLM_CONFIG_KEY, JSON.stringify(config));
        return config;
      }
    }
  } catch {}
  return defaultModelConfig();
}

function normalizeConfig(draft: ModelConfig): ModelConfig {
  return {
    apiKey: draft.apiKey.trim().slice(0, 200), baseUrl: draft.baseUrl.trim(), model: draft.model.trim().slice(0, 80), context_limit: draft.context_limit.trim(),
    temperature: draft.temperature.trim(), top_p: draft.top_p.trim(), top_k: draft.top_k.trim(),
    presence_penalty: draft.presence_penalty.trim(), frequency_penalty: draft.frequency_penalty.trim(), max_tokens: draft.max_tokens.trim(),
  };
}

function persistModelPreferences(config: ModelConfig) {
  try { localStorage.setItem(LLM_CONFIG_KEY, JSON.stringify({ ...config, apiKey: '' })); } catch {}
}

const hasCustomValues = (cfg: ModelConfig) => Boolean(cfg.baseUrl.trim() || cfg.model.trim() || cfg.context_limit.trim() || SAMPLING_FIELDS.some(field => cfg[field].trim()));

type Message = { role: 'user' | 'assistant'; content: string; sources?: Source[]; control?: TerminalControl; complete?: boolean };
const modeCopy = {
  chat: { title: '从一个问题开始。', placeholder: '有什么想了解的？' },
  tutor: { title: '把复杂的事，讲清楚。', placeholder: '想理解哪个概念？' },
  scholar: { title: '沿着原文，核对细节。', placeholder: '想核对哪处原文？' },
} as const;

type TerminalErrorInfo = { message: string; code?: string; phase?: string; requestId?: string; status?: number; hint?: string };
class TerminalRequestError extends Error {
  info: TerminalErrorInfo;
  constructor(info: TerminalErrorInfo) { super(info.message); this.info = info; }
}
export default function WorldTerminal({ mobile = false, accent = '#e7ee72', onOpenChange }: { mobile?: boolean; accent?: string; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false), [input, setInput] = useState('');
  const [mode, setMode] = useState('chat');
  const [site, setSite] = useState('all');
  const [messages, setMessages] = useState<Message[]>([]), [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string; phase?: string; requestId?: string; status?: number; hint?: string } | null>(null), [notice, setNotice] = useState('');
  const [visitorName, setVisitorName] = useState('访客'), [nameDraft, setNameDraft] = useState(''), [editingSpeaker, setEditingSpeaker] = useState<number | null>(null);
  const [modelConfig, setModelConfig] = useState(loadModelConfig), [configOpen, setConfigOpen] = useState(false), [configDraft, setConfigDraft] = useState(modelConfig), [configError, setConfigError] = useState('');
  const dialog = useRef<HTMLDialogElement>(null), trigger = useRef<HTMLButtonElement>(null), editor = useRef<HTMLTextAreaElement>(null);
  const scroll = useRef<HTMLDivElement>(null), controller = useRef<AbortController | null>(null), stick = useRef(true), configPanel = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const configTrigger = useRef<HTMLButtonElement>(null);
  const turnstileMount = useRef<HTMLDivElement>(null);
  const turnstileController = useRef<TurnstileController | null>(null);
  if (!turnstileController.current) turnstileController.current = new TurnstileController();
  const candidates = suggestions.filter(item => item.mode === mode && (site === 'all' || item.site === site));
  // Interleave physical sites for the all-sites view; never confuse site with category.
  const gridPrompts = (site === 'all'
    ? ['blog', 'world', 'zero'].flatMap(id => candidates.find(item => item.site === id) || [])
    : candidates.slice(0, 3)).map(item => item.question);
  const configuredContext = Number(modelConfig.context_limit);
  const contextLimit = Number.isFinite(configuredContext) && configuredContext >= CONTEXT_LIMIT_MIN && configuredContext <= CONTEXT_LIMIT_MAX ? Math.round(configuredContext) : CONTEXT_LIMIT_DEFAULT;
  useEffect(() => {
    if (open) { dialog.current?.showModal(); if (!mobile) editor.current?.focus({ preventScroll: true }); }
    onOpenChange?.(open);
  }, [open, mobile, onOpenChange]);
  useEffect(() => {
    if (!open || !mobile || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const syncViewport = () => {
      // Follow the visible area when the on-screen keyboard opens; retain pinch zoom.
      if (viewport.scale !== 1) return;
      dialog.current?.style.setProperty('--terminal-height', `${viewport.height}px`);
      dialog.current?.style.setProperty('--terminal-top', `${viewport.offsetTop}px`);
      if (viewport.height < 500) dialog.current?.setAttribute('data-compact', 'true');
      else dialog.current?.removeAttribute('data-compact');
    };
    syncViewport();
    viewport.addEventListener('resize', syncViewport);
    viewport.addEventListener('scroll', syncViewport);
    return () => { viewport.removeEventListener('resize', syncViewport); viewport.removeEventListener('scroll', syncViewport); };
  }, [open, mobile]);
  useEffect(() => () => { controller.current?.abort(); turnstileController.current?.dispose(); }, []);
  useEffect(() => {
    if (!configOpen) return;
    configPanel.current?.querySelector('button')?.focus({ preventScroll: true });
  }, [configOpen]);
  useEffect(() => {
    if (!configOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (configPanel.current?.contains(event.target as Node)) return;
      if ((event.target as Element)?.closest?.('.world-terminal__config')) return;
      const next = normalizeConfig(configDraft);
      if (hasCustomValues(next) && !next.apiKey) { setConfigError('自定义了参数时，请填写你自己的 API Key（不可使用站点默认 Key）。'); return; }
      setModelConfig(next); setConfigOpen(false);
      persistModelPreferences(next);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [configOpen, configDraft]);
  useEffect(() => {
    if (scroll.current && (!messages.length || stick.current)) scroll.current.scrollTop = messages.length ? scroll.current.scrollHeight : 0;
  }, [messages, busy, error]);
  function close() { controller.current?.abort(); setConfigOpen(false); setOpen(false); trigger.current?.focus(); }
  function closeConfig() { setConfigOpen(false); configTrigger.current?.focus({ preventScroll: true }); }
  function beginNameEdit(index: number) { setNameDraft(visitorName); setEditingSpeaker(index); }
  function commitName() { const nextName = nameDraft.trim().slice(0, 20); if (nextName) setVisitorName(nextName); setEditingSpeaker(null); }
  function reset(nextMode = mode, nextSite = site) {
    controller.current?.abort(); setMessages([]); setError(null); setNotice(''); setMode(nextMode); setSite(nextSite);
  }
  function openConfig() { setConfigDraft(modelConfig); setConfigError(''); setConfigOpen(true); }
  function saveConfig() {
    const next = normalizeConfig(configDraft);
    if (hasCustomValues(next) && !next.apiKey) { setConfigError('自定义了参数时，请填写你自己的 API Key（不可使用站点默认 Key）。'); return; }
    setConfigError('');
    setModelConfig(next); setConfigOpen(false);
    persistModelPreferences(next);
  }
  function clearConfig() {
    const next = defaultModelConfig();
    setConfigDraft(next); setModelConfig(next); setConfigOpen(false);
    try { localStorage.removeItem(LLM_CONFIG_KEY); } catch {}
  }
  async function send(question = input, retry = false) {
    if (busyRef.current || !question.trim() || question.length > 1200) return;
    if (hasCustomValues(modelConfig) && !modelConfig.apiKey.trim()) {
      setError({ message: '你自定义了模型参数，但未提供自己的 API Key。请打开“模型设置”补填。', code: 'API_KEY_REQUIRED', phase: '校验配置' });
      return;
    }
    const previous = retry ? messages.slice(0, -2) : messages;
    // Only complete pairs enter the next request; a stopped answer cannot become trusted history.
    const history: Message[] = [];
    for (let i = 0; i + 1 < previous.length; i += 2) {
      if (previous[i].role === 'user' && previous[i + 1].complete) history.push(previous[i], previous[i + 1]);
    }
    while (history.length > 8 || history.reduce((n, m) => n + m.content.length, question.length) > contextLimit) history.splice(0, 2);
    const requestMessages = [...history.map(({ role, content }) => ({ role, content })), { role: 'user', content: question.trim() }];
    const next: Message[] = [...previous, { role: 'user', content: question.trim() }, { role: 'assistant', content: '' }];
    setMessages(next); setInput(''); setError(null); setNotice(''); setBusy(true); busyRef.current = true; stick.current = true;
    const abort = new AbortController(); controller.current = abort;
    const timer = window.setTimeout(() => abort.abort('timeout'), 35000);
    let answer = '', sources: Source[] = [], phase = '连接对话接口';
    const configuredTokens = Number(modelConfig.max_tokens);
    // 输出保险上限随用户配置的 max_tokens 放大（英文约 4 字符/token 为最宽情形），未配置时沿用 12000（对应默认 1200 token 的既有余量）。
    const outputCap = Number.isFinite(configuredTokens) && configuredTokens > 0 ? Math.max(12000, configuredTokens * 4) : 12000;
    const update = (complete = false) => {
      const parsed = parseTerminalOutput(answer);
      setMessages([...next.slice(0, -1), { role: 'assistant', content: parsed.content, sources, control: parsed.control, complete }]);
    };
    try {
      phase = '安全验证';
      const turnstileToken = TURNSTILE_SITE_KEY ? await turnstileController.current!.execute(turnstileMount.current!, TURNSTILE_SITE_KEY, abort.signal) : '';
      phase = '连接对话接口';
      const sampling: Record<string, number> = {};
      for (const field of SAMPLING_FIELDS) {
        const raw = modelConfig[field];
        if (raw.trim() !== '' && Number.isFinite(Number(raw))) sampling[field] = Number(raw);
      }
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: requestMessages, category: 'all', site, mode, visitorName, apiKey: modelConfig.apiKey, baseUrl: modelConfig.baseUrl, model: modelConfig.model, context_limit: contextLimit, turnstileToken, requestId: globalThis.crypto.randomUUID(), ...sampling }), signal: abort.signal });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new TerminalRequestError({ message: payload.error || `接口返回 HTTP ${response.status}`, ...payload, status: response.status });
      }
      if (!response.body) throw new Error('浏览器未收到响应流');
      phase = '读取流式回答';
      await readTerminalStream(response.body, event => {
        if (event.type === 'text') { answer += event.value; if (answer.length > outputCap) throw new Error('回答过长，已停止'); update(); }
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
  const placeholder = copy.placeholder;
  const lastAssistant = [...messages].reverse().find(message => message.role === 'assistant');
  const scores = !busy && lastAssistant?.complete ? lastAssistant.control : undefined;
  const contextChars = messages.reduce((total, message) => total + message.content.length, input.length);
  const contextPercent = Math.min(100, Math.round(contextChars / contextLimit * 100));
  const status = busy ? '生成中' : error ? (error.code === 'REQUEST_ABORTED' ? '已停止' : '连接异常') : lastAssistant?.complete ? lastAssistant.control?.label || '已完成' : '就绪';
  const modal = open && <dialog ref={dialog} className={`world-terminal world-terminal--${mode} ${mobile ? 'world-terminal--mobile' : ''}`} aria-labelledby={mobile ? 'mobile-terminal-title' : 'terminal-title'}
    style={{ '--terminal-accent': accent } as CSSProperties} onCancel={e => { e.preventDefault(); close(); }} onClose={close}
    onClick={e => { if (e.target === e.currentTarget) { const box = e.currentTarget.getBoundingClientRect(); if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) close(); } }}>
    <div className="world-terminal__shell">
      <header className="world-terminal__header">
        <div className="world-terminal__brand">
          <span className="world-terminal__monogram" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M12 1H29L39 11V28M28 39H11L1 29V12" stroke="currentColor" /></svg><span>IX</span></span>
          <h2 id={mobile ? 'mobile-terminal-title' : 'terminal-title'}>世界终端</h2>
        </div>
        <button type="button" className="world-terminal__close" onClick={close} aria-label="关闭世界终端"><LauncherIcon name="close" /></button>
      </header>
      <div className="world-terminal__settings">
        <TerminalSelect label="网站来源" value={site} disabled={busy} onChange={value => reset(mode, value)} options={[
          { value: 'all', label: '全部网站', detail: '跨站检索' }, { value: 'blog', label: 'BLOG', detail: 'blog.sch-nie.com' }, { value: 'world', label: 'WORLD', detail: 'world.sch-nie.com' }, { value: 'zero', label: 'ZERO', detail: 'zero.sch-nie.com' },
        ]} />
        <TerminalSelect label="交流模式" value={mode} disabled={busy} onChange={value => reset(value)} options={[
          { value: 'chat', label: '轻松畅聊', detail: '从资料出发，自然交流' }, { value: 'tutor', label: '耐心讲解', detail: '拆解概念，循序渐进' }, { value: 'scholar', label: '资料考据', detail: '核对原文，追溯来源' },
        ]} />
        <button className="world-terminal__new" type="button" disabled={busy || !messages.length} onClick={() => reset()}>新对话</button>
      </div>
      <TerminalStatus status={status} state={busy ? 'busy' : error ? 'error' : 'ready'} contextPercent={contextPercent} contextChars={contextChars} contextLimit={contextLimit} trust={scores?.trust} affinity={scores?.affinity} />
      <div className="world-terminal__thread" ref={scroll} onScroll={() => { const el = scroll.current; if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90; }}>
        {!messages.length && <section className="world-terminal__welcome">
          <div className="world-terminal__welcome-copy">
          <h3>{copy.title}</h3>
          <p>{site === 'all' ? '查阅 BLOG、WORLD、ZERO 的公开资料。' : `查阅 ${site.toUpperCase()} 的公开资料。`}</p>
          </div>
          <div className="world-terminal__suggestions">
            {gridPrompts.map((question, i) => (
              <button key={i} type="button" className="world-terminal__suggestion-card" onClick={() => { setInput(question); editor.current?.focus(); }}>
                <strong>{question}</strong>
                <LauncherIcon name="outbound" />
              </button>
            ))}
          </div>
        </section>}
        {messages.map((message, i) => {
          const generating = busy && i === messages.length - 1;
          const references = !generating && message.control?.sources !== 'none' ? citedSources(message.sources, message.content) : [];
          return <article className={`world-terminal__message world-terminal__message--${message.role}`} key={i}>
          <div className="world-terminal__speaker">{message.role === 'user' ? (editingSpeaker === i ? <form className="world-terminal__name-editor" onSubmit={e => { e.preventDefault(); commitName(); }}><span>YOU /</span><input autoFocus value={nameDraft} maxLength={20} aria-label="临时昵称" onChange={e => setNameDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setEditingSpeaker(null); }} /><button type="submit">保存</button></form> : <button type="button" className="world-terminal__speaker-button" onClick={() => beginNameEdit(i)} aria-label="修改临时昵称">YOU / {visitorName}</button>) : '世界终端'}{message.role === 'assistant' && !message.complete && message.content && !busy ? ' · 未完成' : ''}</div>
          <div className="world-terminal__text">{message.content ? (message.role === 'assistant' ? <ChatMarkdown content={message.content} /> : message.content) : (busy ? '正在检索资料，组织回答…' : '')}</div>
          {references.length > 0 && <details className="world-terminal__sources"><summary>参考资料 · {references.length}</summary>{references.map(source => (
            <a href={source.url} target="_blank" rel="noopener noreferrer" key={`${source.url}-${source.title}`}>
              <span>［{source.numbers.join('、')}］</span> {source.urlKind === 'article' ? `阅读《${source.title}》 ↗` : `${source.title} · 来源入口 ↗`}
              <small>{[source.siteName || source.site?.toUpperCase(), source.section].filter(Boolean).join(' · ')}</small>
            </a>
          ))}</details>}
        </article>; })}
      </div>
      <div className="world-terminal__feedback" aria-live="polite">
        {error && <div className="world-terminal__error" role="alert"><p><strong>{error.message}</strong>{error.status ? ` · HTTP ${error.status}` : ''}</p><p className="world-terminal__error-meta">阶段：{error.phase || '未知'}{error.code ? ` · ${error.code}` : ''}{error.requestId ? ` · 请求 ${error.requestId}` : ''}</p>{error.hint && <p className="world-terminal__error-hint">建议：{error.hint}</p>}{retryQuestion && !busy && <button type="button" onClick={() => send(retryQuestion, true)}>重试上次问题</button>}</div>}
        {notice && <p>{notice}</p>}
      </div>
      {TURNSTILE_SITE_KEY && <div ref={turnstileMount} className="world-terminal__turnstile" aria-label="安全验证" />}
        {configOpen && <div ref={configPanel} className="world-terminal__config-panel" role="dialog" aria-label="模型设置" onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeConfig(); } }}>
          <div className="world-terminal__config-heading"><p className="world-terminal__config-title">模型设置</p><button type="button" className="world-terminal__close" aria-label="关闭模型设置" onClick={closeConfig}><LauncherIcon name="close" /></button></div>
          <p className="world-terminal__config-warning">警告：自定义 Key 会发送到本站服务器、由服务器代你调用大模型，请自行评估风险后再决定是否填入。</p>
          <label>API Key<input type="password" value={configDraft.apiKey} onChange={e => setConfigDraft({ ...configDraft, apiKey: e.target.value })} placeholder="留空使用站点默认 DeepSeek Key" autoComplete="off" aria-label="API Key" /></label>
          <label>接口地址<input value={configDraft.baseUrl} onChange={e => setConfigDraft({ ...configDraft, baseUrl: e.target.value })} placeholder="https://api.deepseek.com/chat/completions" autoComplete="off" aria-label="接口地址" /></label>
          <label>模型名称<input value={configDraft.model} onChange={e => setConfigDraft({ ...configDraft, model: e.target.value })} placeholder="deepseek-chat" autoComplete="off" aria-label="模型名称" /></label>
          <label>上下文窗口上限（{CONTEXT_LIMIT_MIN} ~ {CONTEXT_LIMIT_MAX} 字符）<input type="number" min={CONTEXT_LIMIT_MIN} max={CONTEXT_LIMIT_MAX} step={100} value={configDraft.context_limit} onChange={e => setConfigDraft({ ...configDraft, context_limit: e.target.value })} placeholder={`${CONTEXT_LIMIT_DEFAULT}（默认）`} aria-label="上下文窗口上限" /></label>
          <details className="world-terminal__config-advanced">
            <summary>高级采样参数 <span>留空即用默认</span></summary>
            <p className="world-terminal__config-advhint">仅对 OpenAI 兼容接口生效；服务商不支持的参数会被忽略。</p>
            <div className="world-terminal__config-grid">
              {SAMPLING_CONTROLS.map(({ key: field, label, min, max, step, hint }) => (
                <label key={field}>
                  <span className="world-terminal__config-name">{label}</span>
                  <input type="number" min={min} max={max} step={step} value={configDraft[field]} onChange={e => setConfigDraft({ ...configDraft, [field]: e.target.value })} placeholder="自动" />
                  <span className="world-terminal__config-range">{min} ~ {max}{hint ? ` · ${hint}` : ''}</span>
                </label>
              ))}
            </div>
          </details>
          <p className="world-terminal__config-hint">非敏感配置保存在本机浏览器；API Key 只保留在当前页面内存，并随请求发送给服务器用于调用对应模型，刷新页面后会清除。</p>
          {configError && <p className="world-terminal__config-error" role="alert">{configError}</p>}
          <div className="world-terminal__config-actions">
            <button type="button" onClick={saveConfig}>保存设置</button>
            <button type="button" onClick={clearConfig}>恢复默认</button>
          </div>
        </div>}
      <form className="world-terminal__composer" onSubmit={e => { e.preventDefault(); void send(); }}>
        <textarea ref={editor} value={input} onChange={e => setInput(e.target.value)} maxLength={1200} rows={2} aria-label="输入你的问题" placeholder={placeholder} disabled={busy}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && !mobile) { e.preventDefault(); void send(); } }} />
        <div className="world-terminal__compose-bottom"><span>{input.length > 1000 ? `${input.length} / 1200` : <span className="world-terminal__keyhint">Shift + Enter 换行</span>}</span>
          <div className="world-terminal__compose-actions">
            <button ref={configTrigger} type="button" className="world-terminal__config" onClick={configOpen ? closeConfig : openConfig} aria-label="模型设置" aria-haspopup="dialog" aria-expanded={configOpen} title="模型设置"><LauncherIcon name="info" /></button>
            {busy ? <button type="button" onClick={() => controller.current?.abort()}>停止生成 ■</button> : <button type="submit" disabled={!input.trim()} aria-label="发送问题">发送</button>}
          </div>
        </div>
      </form>
      <footer className="world-terminal__footer">AI 回答请结合原文判断</footer>
    </div>
  </dialog>;
  return <>
    <button ref={trigger} type="button" className={`terminal-trigger ${mobile ? 'terminal-trigger--mobile' : ''}`} onClick={() => setOpen(true)} aria-label="打开世界终端对话入口" aria-haspopup="dialog">
      <span className="terminal-trigger__label">打开对话</span><span className="terminal-trigger__hint">Ask the archive</span><span className="terminal-trigger__arrow" aria-hidden="true">↗</span>
    </button>
    {typeof document !== 'undefined' && modal && createPortal(modal, document.body)}
  </>;
}
