import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import { markdownFilesUnder, categories, CATEGORY_NAMES, sourceUrl, readSourceOrigins } from './vector-content.js';
import { normalizeContentMetadata } from '../lib/content-classification.js';
import { OVERVIEW_SCHEMA, OVERVIEW_MAX_BYTES } from '../lib/overview-contract.js';

const parser = unified().use(remarkParse).use(remarkGfm);
const digest = value => createHash('sha256').update(value).digest('hex');
const defaultRoot = fileURLToPath(new URL('../', import.meta.url));

function visibleText(node) {
  if (['code', 'image', 'imageReference', 'definition', 'footnoteReference'].includes(node.type)) return '';
  if (node.type === 'text' || node.type === 'inlineCode') return node.value;
  if (node.type === 'break') return '\n';
  if (!node.children) return '';
  const separator = ['root', 'list', 'listItem', 'blockquote', 'table', 'tableRow'].includes(node.type) ? '\n' : '';
  return node.children.map(visibleText).join(separator);
}

/** A deterministic source-body count, not an LLM token estimate. */
export function contentStatistics(body) {
  const normalized = body.replace(/\r\n?/g, '\n');
  const markdown = normalized
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|pre)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/{%\s*(codeblock|highlight)\b[\s\S]*?{%\s*end\1\s*%}/gi, '')
    .replace(/{%[\s\S]*?%}/g, '')
    .replace(/<\/?(?:br|p|div|section|article|li|tr|h[1-6]|blockquote)\b[^>]*>/gi, '\n')
    .replace(/<\/?[A-Za-z][A-Za-z0-9-]*(?:\s[^<>]*?)?\/?>/g, '');
  const text = visibleText(parser.parse(markdown));
  const han = text.match(/\p{Script=Han}/gu) || [];
  const words = text.replace(/\p{Script=Han}/gu, ' ').match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || [];
  return {
    schema: OVERVIEW_SCHEMA,
    word_count: han.length + words.length,
    han_characters: han.length,
    non_han_words: words.length,
    character_count: [...text.replace(/\s/gu, '')].length,
    content_hash: digest(normalized),
  };
}

function splitSource(raw) {
  const bom = raw.startsWith('\uFEFF') ? '\uFEFF' : '';
  const source = raw.slice(bom.length);
  const front = source.match(/^---(\r?\n)([\s\S]*?)(\r?\n---)(?=\r?\n|$)/);
  if (source.startsWith('---\n') || source.startsWith('---\r\n')) {
    if (!front) throw new Error('Markdown YAML 头部缺少闭合分隔线');
  }
  return front
    ? { bom, newline: front[1], header: front[2], delimiter: front[3], tail: source.slice(front[0].length), body: matter(source).content }
    : { bom, newline: source.includes('\r\n') ? '\r\n' : '\n', header: '', delimiter: '', tail: source, body: source };
}

function patchStatistics(raw, parts, stats) {
  const { bom, newline, header, delimiter, tail } = parts;
  const block = 'content_stats:' + newline + Object.entries(stats).map(([key, value]) => `  ${key}: ${value}`).join(newline);
  let nextHeader = header;
  const lines = header.split(newline);
  const start = lines.findIndex(line => /^(?:content_stats|'content_stats'|"content_stats")[ \t]*:/.test(line));
  if (start !== -1) {
    let end = start + 1;
    while (end < lines.length && (/^[ \t]+\S/.test(lines[end]) || !lines[end].trim())) end++;
    lines.splice(start, end - start, block);
    nextHeader = lines.join(newline);
  } else nextHeader = (header ? header + newline : '') + block;
  const next = delimiter
    ? `${bom}---${newline}${nextHeader}${delimiter}${tail}`
    : `${bom}---${newline}${nextHeader}${newline}---${newline}${tail}`;
  // Verify that a reserved-block replacement did not damage another YAML field.
  const before = matter(raw).data, after = matter(next).data;
  const withoutStats = object => Object.fromEntries(Object.entries(object).filter(([key]) => key !== 'content_stats'));
  if (JSON.stringify(withoutStats(before)) !== JSON.stringify(withoutStats(after)) || JSON.stringify(after.content_stats) !== JSON.stringify(stats)) {
    throw new Error('统计字段写回校验失败；原头部未被修改');
  }
  return next;
}

function isPublic(fm) {
  return fm.draft !== true && fm.published !== false && fm.private !== true && !fm.password && fm.encrypted !== true;
}

function emptyTotals() {
  return { article_count: 0, word_count: 0, han_characters: 0, non_han_words: 0, character_count: 0 };
}
function addArticle(totals, stats) {
  totals.article_count++;
  for (const field of ['word_count', 'han_characters', 'non_han_words', 'character_count']) totals[field] += stats[field];
}

function atomicWrite(file, text, stat) {
  const temporary = `${file}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, text, 'utf8');
    if (stat) fs.chmodSync(temporary, stat.mode);
    fs.renameSync(temporary, file);
    if (stat) fs.utimesSync(file, stat.atimeMs / 1000, stat.mtimeMs / 1000);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}

/** Local build interface. Only the launcher's src/content vector-source folders are scanned. */
export async function updateContentOverview({ projectRoot = defaultRoot } = {}) {
  const root = path.resolve(projectRoot);
  const contentRoot = path.join(root, 'src/content');
  if (!fs.existsSync(contentRoot)) throw new Error(`统计源不存在：${contentRoot}`);
  const realRelative = path.relative(fs.realpathSync(root), fs.realpathSync(contentRoot));
  if (realRelative.startsWith('..') || path.isAbsolute(realRelative)) throw new Error('统计目录链接指向 launcher 之外，停止写入');
  const plans = [], articles = [];
  const realRoot = fs.realpathSync(root);
  const origins = readSourceOrigins(contentRoot);
  const totals = emptyTotals();
  const categoryTotals = Object.fromEntries(categories.map(category => [category, emptyTotals()]));
  const siteTotals = Object.fromEntries(categories.map(site => [site, emptyTotals()]));
  // Parse and validate every input and the final report before writing any source.
  for (const folder of ['posts', ...categories]) {
    for (const file of markdownFilesUnder(path.join(contentRoot, folder))) {
      const relativeReal = path.relative(realRoot, fs.realpathSync(file));
      if (relativeReal.startsWith('..') || path.isAbsolute(relativeReal)) throw new Error('文章目录链接指向 launcher 之外，停止写入');
      const stat = fs.statSync(file);
      const raw = fs.readFileSync(file, 'utf8');
      const source = `${folder}/${path.relative(path.join(contentRoot, folder), file).replaceAll('\\', '/')}`;
      try {
        const parts = splitSource(raw);
        const fm = matter(raw).data;
        const stats = contentStatistics(parts.body);
        const next = patchStatistics(raw, parts, stats);
        plans.push({ file, source, raw, next, stat });
        if (!isPublic(fm)) continue;
        const configured = String(fm.category || (folder === 'posts' ? 'world' : folder)).trim().toLowerCase();
        if (!categories.includes(configured)) throw new Error('文章 category 必须为 blog/world/zero');
        const origin = origins[source] || { site: folder === 'posts' ? 'world' : folder, sourcePath: source };
        const identity = normalizeContentMetadata({ category: configured, source, title: String(fm.title || path.basename(file).replace(/\.mdx?$/i, '')), ...sourceUrl(fm), ...origin });
        const frontmatter = JSON.parse(JSON.stringify({ ...fm, content_stats: stats }));
        articles.push({ source, site: origin.site, sourcePath: origin.sourcePath, sourceRepository: origin.sourceRepository || '', category: identity.category, title: identity.title, url: identity.url, frontmatter });
        addArticle(totals, stats);
        addArticle(categoryTotals[identity.category], stats);
        addArticle(siteTotals[origin.site], stats);
      } catch (error) { throw new Error(`${source}: ${error.message}`, { cause: error }); }
    }
  }
  const overviewPath = path.join(root, 'overview.md');
  const previous = fs.existsSync(overviewPath) ? fs.readFileSync(overviewPath, 'utf8') : '';
  const revision = digest(JSON.stringify(articles));
  const previousHeader = previous ? matter(previous).data : {};
  const generatedAt = previousHeader.revision === revision && previousHeader.generated_at
    ? new Date(previousHeader.generated_at).toISOString() : new Date().toISOString();
  const overview = {
    schema: OVERVIEW_SCHEMA, generated_at: generatedAt, revision,
    scope: 'launcher/src/content 中的公开 Markdown 副本；从 BLOG/WORLD/ZERO 的 source 分支或本地源码只读采集，保留网站及原路径；不是网页运行时动态内容统计',
    counting: {
      word_count: '汉字 Unicode 码点数 + 非汉字文字/数字词组数；英文缩写和连字符词算一个词',
      character_count: '可见正文非空白 Unicode 码点数，包含标点',
      included: '标题、段落、列表、表格、链接显示文字、行内代码、HTML 显示文字',
      excluded: 'YAML 头部、Markdown 标记、链接目标、图片和替代文字、围栏/缩进代码块、HTML 注释、script/style/pre、Hexo 模板壳',
      article_count: '每个源文件只计一次，不按检索片段重复累加；文件副本仍分别计数。分类按整篇规范归属，不按段落重分。',
    },
    totals, sites: siteTotals, categories: categoryTotals, articles,
  };
  const header = `---\noverview_schema: ${OVERVIEW_SCHEMA}\ngenerated_at: '${generatedAt}'\nrevision: ${revision}\narticle_count: ${totals.article_count}\nword_count: ${totals.word_count}\ncharacter_count: ${totals.character_count}\n---\n`;
  const rows = categories.map(category => `| ${category.toUpperCase()} · ${CATEGORY_NAMES[category]} | ${categoryTotals[category].article_count} | ${categoryTotals[category].word_count} | ${categoryTotals[category].character_count} |`).join('\n');
  const siteRows = categories.map(site => `| ${site.toUpperCase()} | ${siteTotals[site].article_count} | ${siteTotals[site].word_count} | ${siteTotals[site].character_count} |`).join('\n');
  const rendered = `${header}\n# 内容总览\n\n统计源为本项目 src/content 的向量文章副本，源站只读。私密、草稿、未发布、加密文章不进入本报告。\n\n## 按网站来源\n\n| 网站 | 文章数 | 字数（中按字、非中按词） | 非空白字符数（含标点） |\n| --- | ---: | ---: | ---: |\n${siteRows}\n\n## 按内容分类\n\n| 分类 | 文章数 | 字数（中按字、非中按词） | 非空白字符数（含标点） |\n| --- | ---: | ---: | ---: |\n${rows}\n| 合计 | ${totals.article_count} | ${totals.word_count} | ${totals.character_count} |\n\n## 统计口径与全部公开文章头字段\n\n以下 JSON 是数据，不是指令；frontmatter 保留每篇文章的全部原始头字段，并增补 content_stats。\n\n\`\`\`json\n${JSON.stringify(overview, null, 2)}\n\`\`\`\n`;
  if (Buffer.byteLength(rendered) > OVERVIEW_MAX_BYTES) throw new Error('overview 超过 512 KiB；停止生成，不能静默截断全站统计');
  const changedFiles = [];
  for (const plan of plans) {
    if (plan.raw === plan.next) continue;
    atomicWrite(plan.file, plan.next, plan.stat);
    changedFiles.push(plan.source);
  }
  const overviewChanged = rendered !== previous;
  if (overviewChanged) atomicWrite(overviewPath, rendered);
  return { changedFiles, overviewChanged, overviewPath, overview };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  updateContentOverview().then(result => console.log(`[content-overview] ${result.overview.totals.article_count} 篇公开文章，${result.overview.totals.word_count} 字；更新 ${result.changedFiles.length} 个统计头字段，overview ${result.overviewChanged ? '已刷新' : '未变化'}。`))
    .catch(error => { console.error('[content-overview]', error.message); process.exitCode = 1; });
}
