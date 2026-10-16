import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import matter from 'gray-matter';
import { SOURCE_SITES } from '../lib/source-sites.js';
import { markdownFilesUnder } from './vector-content.js';

const defaultRoot = fileURLToPath(new URL('../', import.meta.url));
const excluded = new Set(['_drafts', '_data', 'node_modules', 'vendor', 'lib', 'test-raw-html', '.git']);
const hash = text => createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex');
const publicArticle = fm => fm.private !== true && fm.draft !== true && fm.published !== false && !fm.password && fm.encrypted !== true;
function inside(root, file) {
  const relative = path.relative(root, file);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('输出路径必须在 launcher/src/content 内');
  // Lexical containment is insufficient if a destination directory is a junction.
  let parent = path.dirname(file);
  while (!fs.existsSync(parent)) parent = path.dirname(parent);
  const realRoot = fs.realpathSync(root), realParent = fs.realpathSync(parent);
  const realRelative = path.relative(realRoot, realParent);
  if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) throw new Error('输出目录链接指向 launcher 之外，停止写入');
  if (fs.existsSync(file) && fs.lstatSync(file).isSymbolicLink()) throw new Error('输出文件为符号链接，停止写入');
  return file;
}
function sameAuthoredContent(a, b) {
  const x = matter(a), y = matter(b);
  const clean = data => Object.fromEntries(Object.entries(data).filter(([key]) => key !== 'content_stats'));
  return x.content.replace(/\r\n/g, '\n') === y.content.replace(/\r\n/g, '\n') && JSON.stringify(clean(x.data)) === JSON.stringify(clean(y.data));
}
function articleUrl(site, config, fm, relative) {
  for (const explicit of [fm.url, fm.permalink]) {
    if (typeof explicit !== 'string' || !explicit.trim()) continue;
    const url = new URL(explicit, site.url);
    if (url.protocol === 'https:' && !url.username && !url.password) return { url: url.href, urlKind: 'article' };
  }
  if (!relative.startsWith('_posts/')) {
    const page = relative.replace(/\.mdx?$/i, '.html').replace(/(?:^|\/)index\.html$/, match => match.startsWith('/') ? '/' : '');
    return { url: new URL(page, site.url).href, urlKind: 'article' };
  }
  const template = String(config.permalink || 'posts/:abbrlink.html');
  const date = fm.date instanceof Date ? fm.date : new Date(fm.date || 0);
  const values = { abbrlink: fm.abbrlink, title: fm.slug || path.basename(relative).replace(/\.mdx?$/i, ''), year: date.getUTCFullYear(), month: String(date.getUTCMonth() + 1).padStart(2, '0'), day: String(date.getUTCDate()).padStart(2, '0') };
  const unresolved = [...template.matchAll(/:([a-z_]+)/gi)].some(([, key]) => values[key] === undefined || values[key] === '');
  if (unresolved) return { url: site.url, urlKind: 'site-home' };
  return { url: new URL(template.replace(/:([a-z_]+)/gi, (_, key) => encodeURIComponent(String(values[key]))), site.url).href, urlKind: 'article' };
}

/** Read-only source access; every write/removal is confined to projectRoot. */
export async function importSites({ projectRoot = defaultRoot, sourcesDir = process.env.CONTENT_SOURCES_DIR || path.dirname(projectRoot) } = {}) {
  const root = path.resolve(projectRoot), sources = path.resolve(sourcesDir);
  const contentRoot = path.join(root, 'src/content');
  if (!fs.existsSync(root)) throw new Error('launcher 工程目录不存在');
  inside(root, path.join(contentRoot, '__path_check__'));
  for (const folder of ['posts', ...SOURCE_SITES.map(site => site.id)]) inside(root, path.join(contentRoot, folder, '__path_check__'));
  const desired = new Map(), manifest = { schema: 1, sources: SOURCE_SITES, articles: {} };
  for (const site of SOURCE_SITES) {
    const repositoryRoot = path.join(sources, site.id), sourceRoot = path.join(repositoryRoot, 'source');
    if (!fs.existsSync(sourceRoot)) throw new Error(`${site.name} 源目录不存在：${sourceRoot}；未修改任何文章`);
    const configPath = path.join(repositoryRoot, '_config.yml');
    const config = fs.existsSync(configPath) ? matter(`---\n${fs.readFileSync(configPath, 'utf8')}\n---`).data : {};
    let count = 0;
    for (const file of markdownFilesUnder(sourceRoot)) {
      const relative = path.relative(sourceRoot, file).replaceAll('\\', '/');
      if (relative.split('/').some(part => excluded.has(part))) continue;
      const raw = fs.readFileSync(file, 'utf8');
      let fm;
      try { fm = matter(raw).data; } catch (error) { throw new Error(`${site.id}/source/${relative}: ${error.message}`); }
      if (!publicArticle(fm)) continue;
      const sourcePath = `source/${relative}`, target = `${site.id}/${sourcePath}`;
      const identity = { site: site.id, siteName: site.name, sourcePath, sourceRepository: site.repository, sourceBranch: site.branch, sourceHash: hash(raw), ...articleUrl(site, config, fm, relative) };
      manifest.articles[target] = identity;
      desired.set(target, raw);
      count++;
    }
    if (!count) throw new Error(`${site.name} 没有公开 Markdown，停止以免清空旧内容`);
  }
  // All three sources are validated before any file is changed or removed.
  fs.mkdirSync(contentRoot, { recursive: true });
  for (const relative of desired.keys()) inside(contentRoot, path.join(contentRoot, relative));
  const manifestFile = inside(root, path.join(root, 'generated/source-manifest.json'));
  const previousText = fs.existsSync(manifestFile) ? fs.readFileSync(manifestFile, 'utf8') : '';
  const previous = previousText ? JSON.parse(previousText) : { articles: {} };
  const written = [], removed = [];
  for (const [relative, raw] of desired) {
    const target = inside(contentRoot, path.join(contentRoot, relative));
    if (fs.existsSync(target)) {
      const existing = fs.readFileSync(target, 'utf8');
      if (existing === raw || (previous.articles?.[relative]?.sourceHash === manifest.articles[relative].sourceHash && sameAuthoredContent(existing, raw))) continue;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, raw);
    written.push(relative);
  }
  for (const folder of ['posts', ...SOURCE_SITES.map(site => site.id)]) {
    for (const file of markdownFilesUnder(path.join(contentRoot, folder))) {
      const relative = path.relative(contentRoot, file).replaceAll('\\', '/');
      if (!desired.has(relative)) { fs.unlinkSync(inside(contentRoot, file)); removed.push(relative); }
    }
  }
  const manifestText = JSON.stringify(manifest, null, 2) + '\n';
  if (manifestText !== previousText) { fs.mkdirSync(path.dirname(manifestFile), { recursive: true }); fs.writeFileSync(manifestFile, manifestText); }
  const result = { articleCount: desired.size, changed: !!(written.length || removed.length || manifestText !== previousText), written, removed };
  fs.mkdirSync(path.join(root, '.reports'), { recursive: true });
  fs.writeFileSync(path.join(root, '.reports/content-import.json'), JSON.stringify(result, null, 2) + '\n');
  return result;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  importSites().then(result => console.log(`[content-import] ${result.articleCount} 篇公开 Markdown；写入 ${result.written.length}，清理旧副本 ${result.removed.length}。源仓库只读。`))
    .catch(error => { console.error('[content-import]', error.message); process.exitCode = 1; });
}
