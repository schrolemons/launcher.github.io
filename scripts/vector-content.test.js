import { describe, it, expect } from 'vitest';
import { articleRecords, capacityPlan, prepareRecords } from './vector-content.js';

describe('语义分片', () => {
  it('保留短词条、标题路径和分类，代码中的标题不分节', () => {
    const records = articleRecords('---\ntitle: 宇宙\n---\n## 规则\n简短定义。\n### 例子\n```js\n# not heading\n```', 'world', 'nested/a.md');
    expect(records.some(r => r.data.includes('简短定义'))).toBe(true);
    expect(records.some(r => r.metadata.section === '规则 / 例子')).toBe(true);
    expect(records.every(r => r.metadata.category === 'world')).toBe(true);
    expect(records.every(r => !('site' in r.metadata))).toBe(true);
    expect(records[0].metadata.categoryName).toBe('文明体系');
    expect(records.some(r => r.metadata.section.includes('not heading'))).toBe(false);
  });
  it('缺少标题仍可同步；长段落不会丢失；跨站 ID 不冲突', () => {
    const raw = '## 长文\n' + '甲乙丙丁。'.repeat(800);
    const a = articleRecords(raw, 'blog', 'a.md');
    const b = articleRecords(raw, 'zero', 'a.md');
    expect(a[0].metadata.title).toBe('a');
    expect(a.every(r => r.data.length <= 1800)).toBe(true);
    expect(a.map(r => r.metadata.text).join('')).toBe('甲乙丙丁。'.repeat(800));
    expect(a[0].id).not.toBe(b[0].id);
  });
  it('跳过草稿，拒绝不受信来源 URL', () => {
    expect(articleRecords('---\ndraft: true\n---\nsecret', 'blog', 'draft.md')).toEqual([]);
    const [r] = articleRecords('---\nurl: javascript:alert(1)\n---\n正文', 'blog', 'a.md');
    expect(r.metadata.url).toBe('https://blog.sch-nie.com/');
  });
  it('把同分类 frontmatter url 写入每个向量片段的元数据', () => {
    const [r] = articleRecords('---\ntitle: 可跳转\nurl: /archives/ke-tiao-zhuan\n---\n正文', 'world', 'a.md');
    expect(r.metadata.url).toBe('https://world.sch-nie.com/archives/ke-tiao-zhuan');
    expect(r.metadata.urlKind).toBe('article');
  });
  it('允许 frontmatter category 按内容性质覆盖默认文件夹分类', () => {
    const [r] = articleRecords('---\ntitle: 方法论\ncategory: blog\n---\n正文', 'world', 'a.md');
    expect(r.metadata.category).toBe('blog');
    expect(r.metadata.categoryName).toBe('经验分享与技术博客');
  });
  it('以当前全库占用和新增记录判断 70% 阈值', () => {
    expect(() => capacityPlan({ vectorCount: 98000, indexSize: 0, dimension: 1024 }, [{ data: 'x', metadata: {} }], 1)).toThrow(/容量/);
    expect(capacityPlan({ vectorCount: 598, indexSize: 4000000, dimension: 1024 }, [], 0).recordLimit).toBe(98000);
  });
  it('跨操作系统产生稳定日期和 ID，关联能指向文章内相邻片段', () => {
    const raw = '---\ntitle: 世界\nupdated: 2026-08-25\n---\n## 规则\n第一条。\n## 例子\n第二条。';
    const a = articleRecords(raw, 'world', 'a.md');
    const b = articleRecords(raw.replaceAll('\n', '\r\n'), 'world', 'a.md');
    expect(a.map(r => r.id)).toEqual(b.map(r => r.id));
    expect(a[0].metadata.updatedAt).toBe('2026-08-25T00:00:00.000Z');
    expect(a[0].metadata.nextId).toBe(a[1].id);
    expect(a[1].metadata.previousId).toBe(a[0].id);
    expect(a[0].metadata.summaryMethod).toBe('source-excerpt');
  });
  it('嵌入模型身份写入 metadata，切换模型会生成新版本 ID', () => {
    const source = articleRecords('---\ntitle: 可切换\n---\n正文', 'world', 'a.md');
    const first = prepareRecords(source, 'dense', 'provider/model-a');
    const second = prepareRecords(source, 'dense', 'provider/model-b');
    expect(first[0].metadata.embeddingIdentity).toBe('provider/model-a');
    expect(first[0].id).not.toBe(second[0].id);
  });
});
