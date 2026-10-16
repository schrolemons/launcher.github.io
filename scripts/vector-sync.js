import { capacityPlan } from './vector-content.js';

export async function syncRecords(index, records, namespace, onPlan = () => {}, knownInfo, { readinessChecks = 1, pollIntervalMs = 2000, sleep = ms => new Promise(resolve => setTimeout(resolve, ms)), prepareAdditions = async rows => rows } = {}) {
  if (!records.length || !namespace.startsWith('launcher-')) throw new Error('空内容或非专用分区，停止同步');
  if (!Number.isInteger(readinessChecks) || readinessChecks < 1 || readinessChecks > 61 || !Number.isFinite(pollIntervalMs) || pollIntervalMs < 0 || pollIntervalMs > 5000) throw new Error('Invalid readiness wait configuration');
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
  const requestEstimate = reads + additions.length + stale.length + readinessChecks;
  const plan = { ...capacityPlan(info, additions, additions.length, requestEstimate), namespace,
    additions: additions.length, unchanged: records.length - additions.length, stale: stale.length };
  onPlan(plan);
  const uploads = additions.length ? await prepareAdditions(additions) : [];
  const expectedIds = new Set(additions.map(row => row.id));
  if (!Array.isArray(uploads) || uploads.length !== additions.length || uploads.some(row => !expectedIds.delete(row.id))) throw new Error('Prepared vector records do not match the planned additions');
  for (let i = 0; i < uploads.length; i += 100) await index.upsert(uploads.slice(i, i + 100), { namespace });
  let ready = false;
  for (let attempt = 0; attempt < readinessChecks; attempt++) {
    const after = await index.info();
    if (after.namespaces?.[namespace]?.pendingVectorCount === 0) { ready = true; break; }
    if (attempt + 1 < readinessChecks) await sleep(pollIntervalMs);
  }
  if (!ready) return { ...plan, pending: true };
  for (let i = 0; i < stale.length; i += 100) await index.delete(stale.slice(i, i + 100), { namespace });
  return { ...plan, pending: false };
}
