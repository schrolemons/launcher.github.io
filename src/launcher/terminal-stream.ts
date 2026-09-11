export type Source = { number: number; title: string; section: string; category: string; categoryName?: string; categories?: string[]; url: string; urlKind: 'article' | 'launcher-home' | string; articleId?: string; articleHash?: string };
type EventResult = { type: 'text'; value: string } | { type: 'sources'; value: Source[] } | { type: 'done' } | { type: 'length' } | { type: 'ignore' };
export function parseEvent(frame: string): EventResult {
  const lines = frame.split('\n');
  const event = lines.find(l => l.startsWith('event:'))?.slice(6).trim();
  const data = lines.filter(l => l.startsWith('data:')).map(l => l.slice(5).trimStart()).join('\n');
  if (!data) return { type: 'ignore' };
  if (data === '[DONE]') return { type: 'done' };
  const payload = JSON.parse(data);
  if (event === 'error' || payload.error) throw new Error(typeof payload.error === 'string' ? payload.error : '连接中断，请重试');
  if (event === 'sources') return { type: 'sources', value: Array.isArray(payload) ? payload.slice(0, 12) : [] };
  if (payload.choices?.[0]?.finish_reason === 'length') return { type: 'length' };
  const content = payload.choices?.[0]?.delta?.content;
  return typeof content === 'string' ? { type: 'text', value: content } : { type: 'ignore' };
}

export async function readTerminalStream(body: ReadableStream<Uint8Array>, onEvent: (event: EventResult) => void) {
  const reader = body.getReader(), decoder = new TextDecoder();
  let buffer = '', complete = false, sawText = false;
  const dispatch = (frame: string) => {
    const event = parseEvent(frame);
    if (event.type === 'text') sawText = true;
    if (event.type === 'done') complete = true;
    onEvent(event);
  };
  try {
    while (true) {
      const { done, value } = await reader.read();
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, '\n');
      if (buffer.length > 50000) throw new Error('响应过长，请重试');
      let boundary;
      while ((boundary = buffer.indexOf('\n\n')) >= 0) {
        const frame = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
        dispatch(frame);
      }
      if (done) {
        // Some compatible gateways close after the final data frame without
        // forwarding the provider's [DONE] marker.
        if (buffer.trim()) { dispatch(buffer.trim()); buffer = ''; }
        if (!complete && sawText) complete = true;
        break;
      }
      if (complete) break;
    }
    if (!complete) throw new Error('连接提前中断，可以重试上次问题');
  } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
}
