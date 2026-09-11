import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
import TerminalSelect from './TerminalSelect';

const options = [{ value: 'all', label: '全部资料', detail: 'BLOG / WORLD / ZERO' }, { value: 'world', label: 'WORLD', detail: '文明体系' }];
it('使用主题菜单选择分类，并恢复到触发按钮', () => {
  const onChange = vi.fn();
  render(<TerminalSelect label="内容分类" value="all" options={options} onChange={onChange} />);
  const trigger = screen.getByRole('combobox', { name: '内容分类' });
  fireEvent.click(trigger);
  expect(screen.getByRole('listbox')).toBeVisible();
  fireEvent.click(screen.getByRole('option', { name: /WORLD 文明体系/ }));
  expect(onChange).toHaveBeenCalledWith('world');
  expect(trigger).toHaveFocus();
  expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
});
it('键盘可以导航、选择和取消，禁用时不可打开', () => {
  const onChange = vi.fn();
  const { rerender } = render(<TerminalSelect label="内容分类" value="all" options={options} onChange={onChange} />);
  const trigger = screen.getByRole('combobox');
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
  fireEvent.keyDown(trigger, { key: 'End' });
  fireEvent.keyDown(trigger, { key: 'Enter' });
  expect(onChange).toHaveBeenCalledWith('world');
  fireEvent.click(trigger);
  fireEvent.keyDown(trigger, { key: 'Escape' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  rerender(<TerminalSelect label="内容分类" value="all" options={options} onChange={onChange} disabled />);
  expect(trigger).toBeDisabled();
});
