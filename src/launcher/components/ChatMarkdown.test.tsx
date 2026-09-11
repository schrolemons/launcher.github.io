import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import ChatMarkdown from './ChatMarkdown';

it('渲染受控 Markdown、提示块和安全链接', () => {
  render(<ChatMarkdown content={'## 核心设定\n\n**重点**与 *推测*。\n\n%note primary%\n请注意：这是资料摘要。\n%endnote%\n\n- 第一条\n- 第二条\n\n[阅读来源](https://world.sch-nie.com/article) [危险链接](javascript:alert(1)'} />);
  expect(screen.getByRole('heading', { name: '核心设定' })).toBeInTheDocument();
  expect(screen.getByText('重点')).toBeInTheDocument();
  expect(screen.getByText('primary')).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '阅读来源' })).toHaveAttribute('href', 'https://world.sch-nie.com/article');
  expect(screen.queryByRole('link', { name: '危险链接' })).not.toBeInTheDocument();
});
it('支持单行 note 语法', () => {
  render(<ChatMarkdown content="%note warning% 这是一条提示" />);
  expect(screen.getByText('warning')).toBeInTheDocument();
  expect(screen.getByText('这是一条提示')).toBeInTheDocument();
});
it('把半角和全角引用渲染为彩色上标角标', () => {
  render(<ChatMarkdown content="三篇风格差别挺大:想读思辨选**［3］**,想读抒情选［1］,想读叙事张力选 [2]。" />);
  expect(screen.getByLabelText('参考资料 1').tagName).toBe('SUP');
  expect(screen.getByLabelText('参考资料 1')).toHaveTextContent('［1］');
  expect(screen.getByLabelText('参考资料 2')).toHaveTextContent('［2］');
  expect(screen.getByLabelText('参考资料 3')).toHaveTextContent('［3］');
  expect(screen.getByText((_, element) => element?.tagName === 'P' && element.textContent?.startsWith('三篇风格差别挺大：想读思辨选') === true)).toBeInTheDocument();
});
it('把大 ASCII 表情保留为等宽视觉块', () => {
  render(<ChatMarkdown content={'回答完毕。\n\n*#################*\n#      ^_^      #\n*#################*'} />);
  expect(document.querySelector('.chat-markdown__ascii')).toBeInTheDocument();
  expect(document.querySelector('.chat-markdown__ascii')?.textContent).toContain('^_^');
});
