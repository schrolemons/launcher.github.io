import { expect, it } from 'vitest';
import { citedSources } from './terminal-sources';
import type { Source } from './terminal-stream';

const sources: Source[] = Array.from({ length: 4 }, (_, i) => ({ number: i + 1, title: `文章 ${i + 1}`, section: '正文', category: 'world', url: `https://world.sch-nie.com/posts/${i + 1}`, urlKind: 'article' }));

it('四条候选资料只展示正文实际引用的条目，保持原始编号', () => {
  expect(citedSources(sources, '这句话来自原文。［3］').map(s => s.number)).toEqual([3]);
  expect(citedSources(sources, '你好，没有引用。')).toEqual([]);
  expect(citedSources(sources, '不存在的引用。［9］')).toEqual([]);
});
it('代码、数组、Markdown 链接和链接定义里的数字不是引用', () => {
  expect(citedSources(sources, '示例 `[1]`\n```js\nitems[2]\n```\n[3](https://example.com)\n[4]: https://example.com')).toEqual([]);
});
it('合并同一文章的引用，保留共享索引上不同条目的身份', () => {
  const shared = sources.map(s => ({ ...s, url: 'https://zero.sch-nie.com/core/' }));
  shared[1].title = shared[0].title;
  const result = citedSources(shared, '第一条。［1］第二段。［2］另一个条目。［3］');
  expect(result).toHaveLength(2);
  expect(result[0].numbers).toEqual([1, 2]);
  expect(result[1].title).toBe('文章 3');
});
it('危险链接即使被标注也不能成为参考资料', () => {
  expect(citedSources([{ ...sources[0], url: 'javascript:alert(1)' }], '内容。［1］')).toEqual([]);
});
it('英文与数字后紧贴的角标仍可追溯到来源', () => {
  expect(citedSources(sources, 'Redis[1]，更新于 2026[2]。').map(s => s.number)).toEqual([1, 2]);
});
it('连续角标分别匹配，Markdown 链接内部不产生伪引用', () => {
  expect(citedSources(sources, '有两个依据。[1][2]').map(s => s.number)).toEqual([1, 2]);
  expect(citedSources(sources, '[链接［3］](https://example.com/[4])')).toEqual([]);
});
