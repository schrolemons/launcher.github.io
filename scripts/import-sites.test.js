// @vitest-environment node
import { expect, it } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { importSites } from './import-sites.js';
import { updateContentOverview } from './content-overview.js';
import { collectRecords } from './vector-content.js';

it('三个源站仅被读取，按网站和原路径导入；清理旧副本、过滤私密文章并保留原站直链', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'import-sites-'));
  try {
    const root = path.join(temp, 'launcher'), sources = path.join(temp, 'sources');
    fs.mkdirSync(path.join(root, 'src/content/blog'), { recursive: true });
    fs.writeFileSync(path.join(root, 'src/content/blog/old.md'), '已在别处备份的旧副本');
    const original = '---\ntitle: 原站文章\nabbrlink: 42\ncustom: 保留\n---\n正文';
    for (const site of ['blog', 'world', 'zero']) {
      const folder = path.join(sources, site, 'source/_posts/nested');
      fs.mkdirSync(folder, { recursive: true });
      fs.writeFileSync(path.join(folder, 'a.md'), original);
      fs.writeFileSync(path.join(folder, 'private.md'), '---\npassword: secret\n---\n私密');
      fs.writeFileSync(path.join(sources, site, '_config.yml'), 'permalink: posts/:abbrlink.html\n');
    }
    const first = await importSites({ projectRoot: root, sourcesDir: sources });
    expect(first.articleCount).toBe(3);
    expect(fs.existsSync(path.join(root, 'src/content/blog/old.md'))).toBe(false);
    const copied = path.join(root, 'src/content/world/source/_posts/nested/a.md');
    expect(fs.readFileSync(copied, 'utf8')).toBe(original);
    expect(fs.readFileSync(path.join(sources, 'world/source/_posts/nested/a.md'), 'utf8')).toBe(original);
    expect(fs.existsSync(path.join(root, 'src/content/zero/source/_posts/nested/private.md'))).toBe(false);
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'generated/source-manifest.json')));
    expect(manifest.articles['world/source/_posts/nested/a.md']).toMatchObject({ site: 'world', sourcePath: 'source/_posts/nested/a.md', sourceRepository: 'schrolemons/openwd.github.io', url: 'https://world.sch-nie.com/posts/42.html' });
    const second = await importSites({ projectRoot: root, sourcesDir: sources });
    expect(second.changed).toBe(false);
    await updateContentOverview({ projectRoot: root });
    expect((await importSites({ projectRoot: root, sourcesDir: sources })).changed).toBe(false);
    expect((await updateContentOverview({ projectRoot: root })).changedFiles).toEqual([]);
    expect(collectRecords(path.join(root, 'src/content')).records.every(record => record.metadata.contentStats.word_count === 2)).toBe(true);
    fs.unlinkSync(path.join(sources, 'world/source/_posts/nested/a.md'));
    fs.writeFileSync(path.join(sources, 'world/source/_posts/nested/b.md'), original);
    await importSites({ projectRoot: root, sourcesDir: sources });
    expect(fs.existsSync(copied)).toBe(false);
    expect(fs.existsSync(path.join(root, 'src/content/world/source/_posts/nested/b.md'))).toBe(true);
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});
it('任一源站缺失或 YAML 损坏时，在改动 launcher 内容前停止', async () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'import-sites-error-'));
  try {
    const root = path.join(temp, 'launcher');
    fs.mkdirSync(path.join(root, 'src/content/blog'), { recursive: true });
    const file = path.join(root, 'src/content/blog/keep.md'); fs.writeFileSync(file, '原文');
    await expect(importSites({ projectRoot: root, sourcesDir: path.join(temp, 'missing') })).rejects.toThrow();
    expect(fs.readFileSync(file, 'utf8')).toBe('原文');
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});
