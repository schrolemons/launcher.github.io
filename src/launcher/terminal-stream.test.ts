import { expect, it } from 'vitest';
import { parseEvent } from './terminal-stream';
import { readTerminalStream } from './terminal-stream';
it('解析来源、正文与结束信号', () => {
  expect(parseEvent('event: sources\ndata: [{"number":1}]')).toEqual({ type: 'sources', value: [{ number: 1 }] });
  expect(parseEvent('data: {"choices":[{"delta":{"content":"你好"}}]}')).toEqual({ type: 'text', value: '你好' });
  expect(parseEvent('data: [DONE]')).toEqual({ type: 'done' });
  expect(() => parseEvent('event: error\ndata: {"error":"中断"}')).toThrow('中断');
});
it('处理跨网络包的中文 UTF-8 与不完整响应', async () => {
  const bytes = new TextEncoder().encode('data: {"choices":[{"delta":{"content":"你好"}}]}\n\ndata: [DONE]\n\n');
  const body = new ReadableStream({ start(c) { for (const byte of bytes) c.enqueue(new Uint8Array([byte])); c.close(); } });
  const text: string[] = [];
  await readTerminalStream(body, e => { if (e.type === 'text') text.push(e.value); });
  expect(text.join('')).toBe('你好');
  const broken = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('data: {}\n\n')); c.close(); } });
  await expect(readTerminalStream(broken, () => {})).rejects.toThrow('连接提前中断');
});
