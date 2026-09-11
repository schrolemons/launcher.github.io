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
  expect(screen.getByText('AI 状态')).toBeInTheDocument();
  expect(screen.getByRole('meter', { name: '回答可信度' })).toHaveAttribute('aria-valuenow', '72');
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
it('读取模型状态控制行，更新可信度并隐藏控制语法', async () => {
  const body = new Response([
    'event: sources\ndata: []\n\n',
    'data: {"choices":[{"delta":{"content":"已核对。\\n%status trust=88 mood=focused label=证据清晰%"}}]}\n\n',
    'data: [DONE]\n\n',
  ].join('')).body;
  const fetcher = vi.fn().mockResolvedValue({ ok: true, body });
  vi.stubGlobal('fetch', fetcher);
  render(<WorldTerminal />);
  fireEvent.click(screen.getByRole('button', { name: /打开世界终端/ }));
  fireEvent.change(screen.getByRole('textbox', { name: '输入你的问题' }), { target: { value: '核心设定是什么？' } });
  fireEvent.click(screen.getByRole('button', { name: '发送问题' }));
  await waitFor(() => expect(screen.getByRole('meter', { name: '回答可信度' })).toHaveAttribute('aria-valuenow', '88'));
  expect(screen.getByText('证据清晰')).toBeInTheDocument();
  expect(screen.getByText('已核对。')).toBeInTheDocument();
  expect(screen.queryByText(/%status trust/)).not.toBeInTheDocument();
});
it('切换交流模式会同步更新简介、推荐入口和输入提示', () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  render(<WorldTerminal />);
  fireEvent.click(screen.getByRole('button', { name: /打开世界终端/ }));
  fireEvent.change(screen.getByRole('combobox', { name: '交流模式' }), { target: { value: 'scholar' } });
  expect(screen.getByRole('heading', { name: 'SCHNIE: CHAT WITH AI' })).toBeInTheDocument();
  expect(screen.getByText('沿着来源，核对每一层细节。')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('请帮我考据三个站点里的一个设定…')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /开始考据/ })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('combobox', { name: '检索范围' }), { target: { value: 'blog' } });
  expect(screen.getByText('我会优先核对BLOG · 第九边缘博客的资料，区分原文、推断和仍待确认的部分。')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('请帮我考据BLOG里的一个设定…')).toBeInTheDocument();
  expect(screen.queryByText(/问问三个站点/)).not.toBeInTheDocument();
});
