import { Index } from '@upstash/vector';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import { collectRecords, prepareRecords, capacityPlan, NAMESPACE } from './vector-content.js';
import { retrievalMode } from '../lib/retrieval-text.js';
import { syncRecords } from './vector-sync.js';
import { embedTexts, embeddingConfig, embeddingMode } from '../server/embedding.js';

const root = fileURLToPath(new URL('../src/content/', import.meta.url));
const dryRun = process.argv.includes('--dry-run');
const writeReport = report => {
  fs.mkdirSync(new URL('../.reports/', import.meta.url), { recursive: true });
  fs.writeFileSync(new URL('../.reports/vector-sync.json', import.meta.url), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
};
async function main() {
  const collected = collectRecords(root);
  const mode = retrievalMode();
  const configuredMode = embeddingMode();
  const endpoint = process.env.VECTOR_EMBEDDING_URL || 'https://api.openai.com/v1/embeddings';
  const identity = `${process.env.VECTOR_EMBEDDING_MODEL || (configuredMode === 'upstash-data' ? 'upstash-managed' : 'unconfigured')}|dim:${process.env.VECTOR_EMBEDDING_DIMENSION || 'index'}|endpoint:${configuredMode === 'external' ? endpoint : 'upstash'}`;
  const records = prepareRecords(collected.records, mode, identity), articles = collected.articles;
  if (!records.length) throw new Error('没有可同步文章，拒绝清空远端；请检查目录');
  const summary = { mode: dryRun ? 'offline-dry-run' : 'live', retrievalMode: mode, articles, chunks: records.length,
    sites: Object.fromEntries(['blog', 'world', 'zero'].map(site => [site, records.filter(r => r.metadata.site === site).length])) };
  if (dryRun) {
    writeReport({ ...summary, embeddingMode: configuredMode, embeddingIdentity: identity,
      ...capacityPlan({ vectorCount: 0, indexSize: 0, dimension: Number(process.env.VECTOR_EMBEDDING_DIMENSION || 0) }, records, records.length, records.length),
      metadataExample: records[0].metadata, note: '离线估算，不含远端已有占用；正式同步会核对现有 Dense 索引维度。' });
    return;
  }
  if (!process.env.UPSTASH_VECTOR_REST_URL || !process.env.UPSTASH_VECTOR_REST_TOKEN) throw new Error('缺少 Upstash Vector 环境变量');
  const index = new Index({ url: process.env.UPSTASH_VECTOR_REST_URL, token: process.env.UPSTASH_VECTOR_REST_TOKEN, retry: false });
  const namespace = process.env.UPSTASH_VECTOR_NAMESPACE || NAMESPACE;
  if (!namespace.startsWith('launcher-')) throw new Error('同步 namespace 必须以 launcher- 开头，防止修改其他数据');
  const info = await index.info();
  const config = configuredMode === 'external' ? embeddingConfig() : { mode: configuredMode, model: identity };
  if (!Number.isFinite(info.dimension) || info.dimension <= 0) throw new Error('无法读取现有 Dense 索引维度，停止同步。');
  if (config.dimension && info.dimension !== config.dimension) throw new Error(`嵌入服务维度 ${config.dimension} 与现有 Dense 索引维度 ${info.dimension} 不一致，停止同步。`);
  // Check the 70% guard before any external embedding request is made.
  capacityPlan(info, records, records.length, records.length + 1);
  const prepared = configuredMode === 'external' ? await (async () => {
    const out = [];
    for (let i = 0; i < records.length; i += 64) {
      const batch = records.slice(i, i + 64), vectors = await embedTexts(batch.map(r => r.data));
      if (vectors.some(vector => vector.length !== info.dimension)) throw new Error('嵌入服务返回的向量维度与现有 Dense 索引不一致，停止同步。');
      out.push(...batch.map((r, j) => ({ id: r.id, vector: vectors[j], metadata: r.metadata })));
    }
    return out;
  })() : records;
  const result = await syncRecords(index, prepared, namespace, plan => writeReport({ ...summary, embeddingMode: configuredMode, embeddingIdentity: identity, ...plan }), info);
  writeReport({ ...summary, ...result });
  if (result.pending) {
    console.log('新嵌入仍在处理，保留旧记录；下一次同步会完成清理。');
    return;
  }
  console.log('同步完成；其他 namespace（包括旧默认库）保持原样。');
}
main().catch(error => { console.error('同步停止：', error.message); process.exitCode = 1; });
