import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import WorldTerminal from './WorldTerminal';

beforeEach(() => {
  localStorage.clear();
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
});
afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); });
it('手机打开时不主动聚焦输入框，Enter 保留换行', () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  render(<WorldTerminal mobile />);
  fireEvent.click(screen.getByRole('button', { name: /打开世界终端/ }));
  const editor = screen.getByRole('textbox', { name: '输入你的问题' });
  expect(editor).not.toHaveFocus();
  fireEvent.change(editor, { target: { value: '测试问题' } });
  fireEvent.keyDown(editor, { key: 'Enter' });
  expect(fetcher).not.toHaveBeenCalled();
});
it('Escape 先关闭模型设置并恢复焦点，保留对话窗口', () => {
  render(<WorldTerminal />);
  fireEvent.click(screen.getByRole('button', { name: /打开世界终端/ }));
  fireEvent.click(screen.getByRole('button', { name: '模型设置' }));
  fireEvent.keyDown(screen.getByLabelText('API Key'), { key: 'Escape' });
  expect(screen.queryByRole('dialog', { name: '模型设置' })).not.toBeInTheDocument();
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.getByRole('button', { name: '模型设置' })).toHaveFocus();
});
it('访客 API Key 只保留在当前页面内存，不写入本地存储', async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: '测试结束' }) });
  vi.stubGlobal('fetch', fetcher);
  render(<WorldTerminal />);
  fireEvent.click(screen.getByRole('button', { name: /打开世界终端/ }));
  fireEvent.click(screen.getByRole('button', { name: '模型设置' }));
  fireEvent.change(screen.getByLabelText('API Key'), { target: { value: 'visitor-secret' } });
  fireEvent.change(screen.getByLabelText('模型名称'), { target: { value: 'deepseek-reasoner' } });
  fireEvent.click(screen.getByRole('button', { name: '保存设置' }));
  expect(JSON.parse(localStorage.getItem('sch-nie:llm-config') || '{}').apiKey).toBe('');
  fireEvent.change(screen.getByRole('textbox', { name: '输入你的问题' }), { target: { value: '测试问题' } });
  fireEvent.click(screen.getByRole('button', { name: '发送问题' }));
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
  expect(JSON.parse(fetcher.mock.calls[0][1].body).apiKey).toBe('visitor-secret');
});
it('手机键盘缩小可视区域时对话框同步高度并进入紧凑布局', () => {
  const viewport = Object.assign(new EventTarget(), { height: 844, offsetTop: 0, scale: 1 });
  vi.stubGlobal('visualViewport', viewport);
  render(<WorldTerminal mobile />);
  fireEvent.click(screen.getByRole('button', { name: /打开世界终端/ }));
  const modal = screen.getByRole('dialog');
  viewport.height = 380;
  viewport.offsetTop = 12;
  viewport.dispatchEvent(new Event('resize'));
  expect(modal.style.getPropertyValue('--terminal-height')).toBe('380px');
  expect(modal.style.getPropertyValue('--terminal-top')).toBe('12px');
  expect(modal).toHaveAttribute('data-compact', 'true');
  viewport.height = 844;
  viewport.dispatchEvent(new Event('resize'));
  expect(modal).not.toHaveAttribute('data-compact');
});
it('打开终端及推荐轮播不发起模型请求，关闭后恢复入口', () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  render(<WorldTerminal />);
  fireEvent.click(screen.getByRole('button', { name: /打开世界终端/ }));
  expect(screen.getByRole('dialog')).toBeVisible();
  expect(screen.getByLabelText('内容分类')).toBeInTheDocument();
  expect(screen.getByText('AI 状态')).toBeInTheDocument();
  expect(screen.getByText('上下文窗口')).toBeInTheDocument();
  expect(screen.queryByText('来源')).not.toBeInTheDocument();
  expect(screen.queryByText('ARK 与 WORLD 共用世界档案，AI 按 BLOG / WORLD / ZERO 三类资料分区检索。')).not.toBeInTheDocument();
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
  const payload = JSON.parse(fetcher.mock.calls[0][1].body);
  expect(payload.messages[0].role).toBe('user');
  expect(payload.requestId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  expect(screen.getByRole('button', { name: '重试上次问题' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '修改临时昵称' }));
  fireEvent.change(screen.getByRole('textbox', { name: '临时昵称' }), { target: { value: '档案访客' } });
  fireEvent.click(screen.getByRole('button', { name: '保存' }));
  expect(screen.getByRole('button', { name: '修改临时昵称' })).toHaveTextContent('YOU / 档案访客');
});
it('读取模型状态控制行，更新可信度并隐藏控制语法', async () => {
  const body = new Response([
    'event: sources\ndata: [{"number":1,"title":"终末阵列","section":"规则","category":"world","url":"https://world.sch-nie.com/articles/end","urlKind":"article"},{"number":2,"title":"终末阵列","section":"规则 / 延伸","category":"world","url":"https://world.sch-nie.com/articles/end","urlKind":"article"}]\n\n',
    'data: {"choices":[{"delta":{"content":"已核对。［1］\\n%status trust=88 affinity=76 mood=focused label=证据清晰%"}}]}\n\n',
    'data: [DONE]\n\n',
  ].join('')).body;
  const fetcher = vi.fn().mockResolvedValue({ ok: true, body });
  vi.stubGlobal('fetch', fetcher);
  render(<WorldTerminal />);
  fireEvent.click(screen.getByRole('button', { name: /打开世界终端/ }));
  fireEvent.change(screen.getByRole('textbox', { name: '输入你的问题' }), { target: { value: '核心设定是什么？' } });
  fireEvent.click(screen.getByRole('button', { name: '发送问题' }));
  await waitFor(() => expect(screen.getByRole('meter', { name: '回答可信度' })).toHaveAttribute('aria-valuenow', '88'));
  expect(screen.getByRole('meter', { name: '好感度' })).toHaveAttribute('aria-valuenow', '76');
  expect(screen.getByText('证据清晰')).toBeInTheDocument();
  expect(screen.getByText('已核对。')).toBeInTheDocument();
  expect(screen.getAllByRole('link', { name: '阅读《终末阵列》 ↗' })).toHaveLength(1);
  expect(screen.getByRole('link', { name: '阅读《终末阵列》 ↗' })).toHaveAttribute('href', 'https://world.sch-nie.com/articles/end');
  expect(screen.queryByText(/%status trust/)).not.toBeInTheDocument();
});
it('仅提及来源但未标注角标时不显示推荐卡片', async () => {
  const body = new Response([
    'event: sources\ndata: [{"number":1,"title":"终末阵列","section":"规则","category":"world","url":"https://world.sch-nie.com/articles/end","urlKind":"article"}]\n\n',
    'data: {"choices":[{"delta":{"content":"终末阵列是一套设定。\\n%status trust=80 affinity=70 mood=calm label=已核对 sources=show%"}}]}\n\n',
    'data: [DONE]\n\n',
  ].join('')).body;
  const fetcher = vi.fn().mockResolvedValue({ ok: true, body });
  vi.stubGlobal('fetch', fetcher);
  render(<WorldTerminal />);
  fireEvent.click(screen.getByRole('button', { name: /打开世界终端/ }));
  fireEvent.change(screen.getByRole('textbox', { name: '输入你的问题' }), { target: { value: '终末阵列是什么？' } });
  fireEvent.click(screen.getByRole('button', { name: '发送问题' }));
  await waitFor(() => expect(screen.getByText('终末阵列是一套设定。')).toBeInTheDocument());
  expect(screen.queryByRole('link', { name: /阅读《/ })).not.toBeInTheDocument();
});
it('切换交流模式会同步更新简介、推荐入口和输入提示', () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher);
  render(<WorldTerminal />);
  fireEvent.click(screen.getByRole('button', { name: /打开世界终端/ }));
  fireEvent.click(screen.getByRole('combobox', { name: '交流模式' }));
  fireEvent.click(screen.getByRole('option', { name: /资料考据/ }));
  expect(screen.getByRole('heading', { name: '世界终端 CHAT WITH AI' })).toBeInTheDocument();
  expect(screen.getByText('沿着来源，核对每一层细节。')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('请帮我考据三类资料里的一个设定…')).toBeInTheDocument();
  const cards = screen.getAllByRole('button').filter(b => b.className.includes('suggestion-card'));
  expect(cards.length).toBe(3);
  fireEvent.click(screen.getByRole('combobox', { name: '内容分类' }));
  fireEvent.click(screen.getByRole('option', { name: /BLOG 经验与技术/ }));
  expect(screen.getByText('我会优先核对BLOG · 经验与技术的资料，区分原文、推断和仍待确认的部分。')).toBeInTheDocument();
  expect(screen.getByPlaceholderText('请帮我考据BLOG里的一个设定…')).toBeInTheDocument();
  expect(screen.queryByText(/问问三类资料/)).not.toBeInTheDocument();
});
