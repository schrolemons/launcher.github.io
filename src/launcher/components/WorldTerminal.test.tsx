import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import WorldTerminal from './WorldTerminal';

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
});
afterEach(() => vi.unstubAllGlobals());
it('打开终端及推荐轮播不发起模型请求，关闭后恢复入口', () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  render(<WorldTerminal />);
  fireEvent.click(screen.getByRole('button', { name: /打开世界终端/ }));
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.getByLabelText('检索范围')).toBeInTheDocument();
  expect(fetcher).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: '关闭世界终端' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('仅主动发送时请求 API，展示错误且可以重试', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: '终端今日服务预算已用完' }) });
  vi.stubGlobal('fetch', fetcher);
  render(<WorldTerminal />);
  fireEvent.click(screen.getByRole('button', { name: /打开世界终端/ }));
  fireEvent.change(screen.getByRole('textbox', { name: '输入你的问题' }), { target: { value: '终末阵列是什么？' } });
  fireEvent.click(screen.getByRole('button', { name: '发送问题' }));
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('终端今日服务预算已用完'));
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(JSON.parse(fetcher.mock.calls[0][1].body).messages[0].role).toBe('user');
  expect(screen.getByRole('button', { name: '重试上次问题' })).toBeInTheDocument();
});
