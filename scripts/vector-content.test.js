import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { articleRecords, capacityPlan, collectRecords, markdownFilesUnder, prepareRecords, recommendations } from './vector-content.js';

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
  it('跳过草稿，拒绝危险 URL 并回退到 launcher', () => {
    expect(articleRecords('---\ndraft: true\n---\nsecret', 'blog', 'draft.md')).toEqual([]);
    const [r] = articleRecords('---\nurl: javascript:alert(1)\n---\n正文', 'blog', 'a.md');
    expect(r.metadata.url).toBe('https://launcher.sch-nie.com/');
    expect(r.metadata.urlKind).toBe('launcher-home');
  });
  it('把 frontmatter url 原样写入每个向量片段的元数据', () => {
    const [r] = articleRecords('---\ntitle: 可跳转\nurl: https://docs.sch-nie.com/archives/ke-tiao-zhuan\ncategories: [设定集]\n---\n正文', 'world', 'a.md');
    expect(r.metadata.url).toBe('https://docs.sch-nie.com/archives/ke-tiao-zhuan');
    expect(r.metadata.urlKind).toBe('article');
    expect(r.metadata.categories).toEqual(['设定集']);
  });
  it('允许 frontmatter category 按内容性质覆盖默认文件夹分类', () => {
    const [r] = articleRecords('---\ntitle: 方法论\ncategory: blog\n---\n正文', 'world', 'a.md');
    expect(r.metadata.category).toBe('blog');
    expect(r.metadata.categoryName).toBe('经验分享与技术博客');
  });
  it('把六个 ZERO 条目的旧文件名统一为规范名称和 ZERO 分类', () => {
    const cases = [
      ['posts/人生行迹.md', '人生观', '人生观'],
      ['posts/宇宙基础.md', '宇宙观', '世界观'],
      ['posts/自然万态.md', '自然观', '自然观'],
      ['posts/金泽范式.md', '灵耀体系：金泽范式', '金泽范式'],
      ['posts/火神契约.md', '灵耀体系：火神契约', '火神契约'],
      ['posts/光与流辰.md', '灵耀体系：光与流辰', '光引流辰'],
    ];
    for (const [source, sourceTitle, canonicalTitle] of cases) {
      const [record] = articleRecords(`---\ntitle: ${sourceTitle}\n---\n正文`, 'world', source);
      expect(record.metadata.category).toBe('zero');
      expect(record.metadata.categoryName).toBe('核心内容与关键信息');
      expect(record.metadata.title).toBe(canonicalTitle);
      expect(record.data).toContain(`ZERO | ${canonicalTitle}`);
    }
  });
  it('木缘桑庭本体仍属 WORLD，仅把其中六项条目介绍归入 ZERO', () => {
    const records = articleRecords(`---\ntitle: 灵耀体系：木缘桑庭\n---\n## 主神时代\n#### [金泽范式](https://world.sch-nie.com/posts/23.html)\n介绍正文。\n#### [其它设定](https://world.sch-nie.com/posts/1.html)\nWORLD 正文。`, 'world', 'posts/木缘桑庭.md');
    const zero = records.find(r => r.metadata.text.includes('介绍正文'));
    const world = records.find(r => r.metadata.text.includes('WORLD 正文'));
    expect(zero.metadata).toMatchObject({ category: 'zero', categoryName: '核心内容与关键信息', title: '金泽范式', url: 'https://zero.sch-nie.com/core/', urlKind: 'article' });
    expect(world.metadata).toMatchObject({ category: 'world', categoryName: '文明体系', title: '灵耀体系：木缘桑庭' });
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
  it('推荐问题不会因条目同时有入口和解读段落而重复', () => {
    const base = { metadata: { category: 'zero', title: '金泽范式' } };
    expect(recommendations([{ ...base, metadata: { ...base.metadata, articleId: 'entry' } }, { ...base, metadata: { ...base.metadata, articleId: 'overview' } }])).toHaveLength(1);
  });
  it('递归读取三类目录内任意层级的 Markdown，嵌套文件夹不改变分类', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'launcher-content-'));
    try {
      const fixtures = [
        ['blog/_posts/Hexo/入门.md', '博客文章'],
        ['world/core/create/设定.mdx', '世界设定'],
        ['zero/哲学/内核/条目.md', '核心条目'],
      ];
      for (const [relative, title] of fixtures) {
        const target = path.join(root, ...relative.split('/'));
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, `---\ntitle: ${title}\n---\n正文`, 'utf8');
      }
      fs.writeFileSync(path.join(root, 'blog', '_posts', '说明.txt'), '忽略', 'utf8');

      expect(markdownFilesUnder(path.join(root, 'blog')).map(file => path.basename(file))).toEqual(['入门.md']);
      const { records, articles } = collectRecords(root);
      expect(articles).toBe(3);
      expect(records.map(record => [record.metadata.source, record.metadata.category])).toEqual([
        ['blog/_posts/Hexo/入门.md', 'blog'],
        ['world/core/create/设定.mdx', 'world'],
        ['zero/哲学/内核/条目.md', 'zero'],
      ]);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
