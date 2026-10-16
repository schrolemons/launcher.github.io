import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE_SITES } from '../lib/source-sites.js';
import { importSites } from './import-sites.js';
import { updateContentOverview } from './content-overview.js';

const defaultRoot = fileURLToPath(new URL('../', import.meta.url));
export async function refreshContent({ projectRoot = defaultRoot, sourcesDir = process.env.CONTENT_SOURCES_DIR } = {}) {
  const sourceParent = path.resolve(sourcesDir || path.dirname(projectRoot));
  const available = SOURCE_SITES.map(site => fs.existsSync(path.join(sourceParent, site.id, 'source')));
  let imported = null;
  if (sourcesDir || available.some(Boolean)) imported = await importSites({ projectRoot, sourcesDir: sourceParent });
  else if (!fs.existsSync(path.join(projectRoot, 'generated/source-manifest.json'))) throw new Error('没有源站目录或采集缓存；请先运行 content:import');
  const result = await updateContentOverview({ projectRoot });
  return { imported, ...result };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  refreshContent().then(result => console.log(`[content-refresh] ${result.overview.totals.article_count} 篇，${result.overview.totals.word_count} 字；${result.imported ? '源站只读采集完成' : '使用已提交的采集缓存'}；overview ${result.overviewChanged ? '已刷新' : '未变化'}。`))
    .catch(error => { console.error('[content-refresh]', error.message); process.exitCode = 1; });
}
