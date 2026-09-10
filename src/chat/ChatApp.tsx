import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const PLACEHOLDER_HINTS = [
  "博客里提到的「宏鳞」是什么？",
  "冰结明域的世界观是怎样的？",
  "借以神名讲了一个什么故事？",
];

export default function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const isEmpty = messages.length === 0 && !streamingContent;

  // ─── Auto-scroll ───
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // ─── Auto-resize textarea ───
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 128) + "px";
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  // ─── Send message ───
  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || streaming) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setStreaming(true);
    setStreamingContent("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `请求失败 (${res.status})`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("无法读取响应流");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine || !trimmedLine.startsWith("data:")) continue;

          const data = trimmedLine.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              fullContent += delta;
              setStreamingContent(fullContent);
            }
          } catch {
            // skip unparseable chunks
          }
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: fullContent }]);
      setStreamingContent("");
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const msg = err instanceof Error ? err.message : "未知错误";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ " + msg },
      ]);
      setStreamingContent("");
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, messages, streaming]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleHintClick = (hint: string) => {
    setInput(hint);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleStop = () => {
    abortRef.current?.abort();
  };

  return (
    <div className="chat-layout">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header__logo">AI</div>
        <span className="chat-header__title">SCHNIE 对话助手</span>
        <span className="chat-header__dot" />
      </header>

      {/* Empty state */}
      {isEmpty && (
        <div className="chat-empty">
          <svg
            className="chat-empty__icon"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2a5 5 0 0 1 5 5v3a5 5 0 0 1-5 5" />
            <path d="M16 10a5 5 0 0 1-5 5 5 5 0 0 1-5-5V7a5 5 0 0 1 10 0v3" />
            <circle cx="5" cy="7" r="1" />
            <circle cx="19" cy="7" r="1" />
          </svg>
          <h2 className="chat-empty__title">有问题想问？</h2>
          <p className="chat-empty__sub">
            基于博客内容为你解答，支持 Markdown、代码块，答案都会注明出处。
          </p>
          <div className="chat-empty__hints">
            {PLACEHOLDER_HINTS.map((hint) => (
              <button
                key={hint}
                className="chat-empty__hint"
                onClick={() => handleHintClick(hint)}
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {!isEmpty && (
        <div className="chat-messages">
          <div className="chat-messages__inner">
            {messages.map((msg, i) => (
              <div key={i} className={"chat-msg chat-msg--" + msg.role}>
                <div
                  className="chat-msg__bubble"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
                <div className="chat-msg__meta">
                  {msg.role === "user" ? "你" : "助手"}
                </div>
              </div>
            ))}

            {streamingContent && (
              <div className="chat-msg chat-msg--assistant">
                <div
                  className="chat-msg__bubble"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingContent) }}
                />
                <div className="chat-msg__meta">
                  <span className="chat-typing">
                    <span className="chat-typing__dot" />
                    <span className="chat-typing__dot" />
                    <span className="chat-typing__dot" />
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Input */}
      <form className="chat-input-area" onSubmit={handleSubmit}>
        <div className="chat-input-wrap">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题，Enter 发送，Shift+Enter 换行"
            rows={1}
            disabled={streaming}
          />
          {streaming ? (
            <button
              type="button"
              className="chat-input__send"
              onClick={handleStop}
              title="停止生成"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              type="submit"
              className="chat-input__send"
              disabled={!input.trim()}
              title="发送"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          )}
        </div>
        <p className="chat-disclaimer">回答由 AI 生成，仅供参考</p>
      </form>
    </div>
  );
}

/* ─── Minimal Markdown-to-HTML renderer ─── */
function renderMarkdown(text: string): string {
  let html = text;

  // Escape HTML
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code blocks ```...```
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_: string, lang: string, code: string) =>
      '<pre><code class="language-' + (lang || "text") + '">' + code.trim() + "</code></pre>"
  );

  // Inline code `...`
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");

  // Italic
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");

  // Headers
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Lists
  html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, (match: string) => {
    if (match.includes("<ul>")) return match;
    return "<ol>" + match + "</ol>";
  });

  // Blockquotes
  html = html.replace(/^&gt; (.+)$/gm, "<blockquote>$1</blockquote>");

  // HR
  html = html.replace(/^---$/gm, "<hr/>");

  // Paragraphs
  const lines = html.split("\n");
  const result: string[] = [];
  let inBlock = false;

  for (const line of lines) {
    const startsBlock = /^<(pre|ul|ol|li|h[1-3]|blockquote|hr)/.test(line);
    const endsBlock = /^<\/(pre|ul|ol|h[1-3]|blockquote)>/.test(line) || line === "<hr/>";

    if (startsBlock) {
      result.push(line);
      inBlock = /^<(pre|ul|ol)/.test(line);
    } else if (endsBlock) {
      result.push(line);
      inBlock = false;
    } else if (line.trim() === "") {
      result.push("");
    } else if (!inBlock) {
      result.push("<p>" + line + "</p>");
    } else {
      result.push(line);
    }
  }

  return result.join("\n");
}