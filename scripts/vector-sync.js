import { capacityPlan } from './vector-content.js';

export async function syncRecords(index, records, namespace, onPlan = () => {}, knownInfo) {
  if (!records.length || !namespace.startsWith('launcher-')) throw new Error('空内容或非专用分区，停止同步');
  const info = knownInfo || await index.info();
  const existing = new Set();
  let cursor = '0', reads = 1;
  do {
    const page = await index.range({ cursor, limit: 1000, includeMetadata: false }, { namespace });
    for (const record of page.vectors) existing.add(String(record.id));
    cursor = page.nextCursor;
    if (++reads > 1400) throw new Error('远端扫描超出预算，停止同步');
  } while (cursor && String(cursor) !== '0');
  const desired = new Set(records.map(r => r.id));
  const additions = records.filter(r => !existing.has(r.id));
  const stale = [...existing].filter(id => !desired.has(id));
  const requestEstimate = reads + additions.length + stale.length + 1;
  const plan = { ...capacityPlan(info, additions, additions.length, requestEstimate), namespace,
    additions: additions.length, unchanged: records.length - additions.length, stale: stale.length };
  onPlan(plan);
  for (let i = 0; i < additions.length; i += 100) await index.upsert(additions.slice(i, i + 100), { namespace });
  const after = await index.info();
  if (!after.namespaces?.[namespace] || after.namespaces[namespace].pendingVectorCount > 0) return { ...plan, pending: true };
  for (let i = 0; i < stale.length; i += 100) await index.delete(stale.slice(i, i + 100), { namespace });
  return { ...plan, pending: false };
}
