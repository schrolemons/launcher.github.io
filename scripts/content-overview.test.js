// @vitest-environment node
import { afterEach, expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import matter from 'gray-matter';
import { contentStatistics, updateContentOverview } from './content-overview.js';

const roots = [];
function project() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'content-overview-'));
  roots.push(root);
  return root;
}
function article(root, relative, raw) {
  const file = path.join(root, 'src/content', relative);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, raw);
  return file;
}
afterEach(() => { for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });

it('按可见正文统计中文和非中文词，排除图片、代码块、脚本及模板壳', () => {
  const body = '# 标题\n\n你好 **世界**， [read more](https://example.com/not-counted) `x=1`。\n\n![忽略图](image.png)\n\n```js\nignored code\n```\n\n<style>ignored</style><script>ignored</script>\n\n{% note info %}提示{% endnote %}\n\nA&amp;B 123.';
  expect(contentStatistics(body)).toMatchObject({ word_count: 15, han_characters: 8, non_han_words: 7, character_count: 28 });
});
it('表格和 HTML 实体按显示文字统计，强调标记不拆开英文词', () => {
  expect(contentStatistics('| 中文 | English |\n|---|---|\n|甲|Hi &copy;|')).toMatchObject({ word_count: 5, han_characters: 3, non_han_words: 2, character_count: 13 });
  expect(contentStatistics('hel**lo** <em>world</em>')).toMatchObject({ word_count: 2, character_count: 10 });
});
it('正文哈希不因 CRLF 与 LF 不同而变化，补充平面汉字按一个字统计', () => {
  expect(contentStatistics('𠮷\r\nHello').content_hash).toBe(contentStatistics('𠮷\nHello').content_hash);
  expect(contentStatistics('𠮷')).toMatchObject({ word_count: 1, character_count: 1 });
});
it('只更新自有头字段，保留 BOM、CRLF、头部注释、正文和 mtime；重复生成不写文件', async () => {
  const root = project();
  const prefix = '\uFEFF---\r\ntitle: \'原文\' # 作者注释\r\ncategories:\r\n  - 随笔\r\n';
  const body = '\r\n正文 **不变**。\r\n';
  const file = article(root, 'blog/a.md', prefix + '---\r\n' + body);
  fs.utimesSync(file, 1700000000, 1700000000);
  const result = await updateContentOverview({ projectRoot: root });
  const first = fs.readFileSync(file, 'utf8');
  expect(first.startsWith(prefix)).toBe(true);
  expect(first.slice(first.indexOf('\r\n---\r\n') + 7)).toBe(body);
  expect(first.replaceAll('\r\n', '').includes('\n')).toBe(false);
  expect(fs.statSync(file).mtimeMs).toBe(1700000000000);
  expect(result.overview.totals).toMatchObject({ article_count: 1, word_count: 4 });
  expect(result.overview.articles[0].frontmatter).toMatchObject({ title: '原文', categories: ['随笔'], content_stats: { word_count: 4 } });
  const second = await updateContentOverview({ projectRoot: root });
  expect(second.changedFiles).toEqual([]);
  expect(second.overviewChanged).toBe(false);
  expect(fs.readFileSync(file, 'utf8')).toBe(first);
  expect(fs.existsSync(path.join(root, 'overview.md'))).toBe(true);
});
it('正文变更会替换旧统计块，不累积重复头字段；无头部文件也能补充', async () => {
  const root = project();
  const file = article(root, 'world/a.md', '正文');
  await updateContentOverview({ projectRoot: root });
  fs.appendFileSync(file, '新字');
  await updateContentOverview({ projectRoot: root });
  const raw = fs.readFileSync(file, 'utf8');
  expect((raw.match(/^content_stats:/gm) || [])).toHaveLength(1);
  expect(matter(raw).data.content_stats.word_count).toBe(4);
  expect(matter(raw).content).toBe('正文新字');
});
it('递归收集公开文章的完整头字段和分类合计，私密文件不进入总览，overview 不自计', async () => {
  const root = project();
  article(root, 'blog/deep/a.md', '---\ntitle: 博客\ncustom: {keep: yes}\n---\n你好 Hello');
  article(root, 'world/b.md', '---\ntitle: 世界\ncategory: zero\n---\n再见');
  for (const [i, flag] of ['private: true', 'draft: true', 'published: false', 'password: hidden', 'encrypted: true'].entries()) {
    article(root, `zero/secret${i}.md`, `---\ntitle: 私密标题${i}\n${flag}\n---\n私密正文`);
  }
  fs.writeFileSync(path.join(root, 'overview.md'), '旧总览不能计入文章');
  const result = await updateContentOverview({ projectRoot: root });
  expect(result.overview.totals).toMatchObject({ article_count: 2, word_count: 5 });
  expect(result.overview.categories.blog).toMatchObject({ article_count: 1, word_count: 3 });
  expect(result.overview.categories.zero).toMatchObject({ article_count: 1, word_count: 2 });
  expect(result.overview.articles[0].frontmatter.custom).toEqual({ keep: 'yes' });
  const rendered = fs.readFileSync(path.join(root, 'overview.md'), 'utf8');
  expect(rendered).not.toContain('私密标题');
  expect(rendered).not.toContain('私密正文');
  expect(rendered).not.toContain('hidden');
});
it('先校验所有文章的 YAML，错误时不留下部分写回', async () => {
  const root = project();
  const original = '---\ntitle: 正常\n---\n正文';
  const good = article(root, 'blog/00good.md', original);
  article(root, 'world/zzbroken.md', '---\ntitle: [broken\n---\n正文');
  await expect(updateContentOverview({ projectRoot: root })).rejects.toThrow();
  expect(fs.readFileSync(good, 'utf8')).toBe(original);
  expect(fs.existsSync(path.join(root, 'overview.md'))).toBe(false);
});
it('分类目录链接到源站时拒绝写回，不能只检查 src/content 本身', async () => {
  const root = project(), outside = project();
  fs.mkdirSync(path.join(root, 'src/content'), { recursive: true });
  const raw = '---\ntitle: 只读源文章\n---\n正文';
  const original = path.join(outside, 'original.md'); fs.writeFileSync(original, raw);
  fs.symlinkSync(outside, path.join(root, 'src/content/blog'), 'junction');
  await expect(updateContentOverview({ projectRoot: root })).rejects.toThrow(/launcher|链接/);
  expect(fs.readFileSync(original, 'utf8')).toBe(raw);
});
