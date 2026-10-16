// @vitest-environment node
import { expect, it, vi } from 'vitest';
import { syncRecords } from './vector-sync.js';
const info = { vectorCount: 1, indexSize: 1000, dimension: 1536, namespaces: { 'launcher-v2': { pendingVectorCount: 0 } } };
const record = { id: 'new', data: '正文', metadata: { title: '世界' } };
function fakeIndex() {
  return { info: vi.fn().mockResolvedValue(info), range: vi.fn().mockResolvedValue({ vectors: [{ id: 'old' }], nextCursor: '0' }),
    upsert: vi.fn().mockResolvedValue('Success'), delete: vi.fn().mockResolvedValue({ deleted: 1 }) };
}
it('全部新数据上传成功后才删旧版本，且只操作专用分区', async () => {
  const index = fakeIndex();
  await syncRecords(index, [record], 'launcher-v2');
  expect(index.delete.mock.invocationCallOrder[0]).toBeGreaterThan(index.upsert.mock.invocationCallOrder[0]);
  expect(index.delete).toHaveBeenCalledWith(['old'], { namespace: 'launcher-v2' });
});
it('上传失败或嵌入未完成时保留旧记录', async () => {
  const index = fakeIndex(); index.upsert.mockRejectedValue(new Error('network'));
  await expect(syncRecords(index, [record], 'launcher-v2')).rejects.toThrow('network');
  expect(index.delete).not.toHaveBeenCalled();
  const pending = fakeIndex(); pending.info.mockResolvedValueOnce(info).mockResolvedValueOnce({ ...info, namespaces: { 'launcher-v2': { pendingVectorCount: 1 } } });
  expect((await syncRecords(pending, [record], 'launcher-v2')).pending).toBe(true);
  expect(pending.delete).not.toHaveBeenCalled();
});
it('重复运行不重新嵌入，空内容或容量超限不写入', async () => {
  const index = fakeIndex(); index.range.mockResolvedValue({ vectors: [{ id: 'new' }], nextCursor: '0' });
  await syncRecords(index, [record], 'launcher-v2'); expect(index.upsert).not.toHaveBeenCalled();
  await expect(syncRecords(index, [], 'launcher-v2')).rejects.toThrow();
  const full = fakeIndex(); full.info.mockResolvedValue({ ...info, vectorCount: 98000 });
  await expect(syncRecords(full, [record], 'launcher-v2')).rejects.toThrow('容量');
  expect(full.upsert).not.toHaveBeenCalled(); expect(full.delete).not.toHaveBeenCalled();
});
it('等待托管嵌入就绪后自动清理旧版本，不重复上传新记录', async () => {
  const index = fakeIndex();
  const pending = { ...info, namespaces: { 'launcher-v2': { pendingVectorCount: 1 } } };
  index.info.mockResolvedValueOnce(info).mockResolvedValueOnce(pending).mockResolvedValueOnce(info);
  const sleep = vi.fn().mockResolvedValue();
  const result = await syncRecords(index, [record], 'launcher-v2', () => {}, undefined, { readinessChecks: 3, pollIntervalMs: 1, sleep });
  expect(result.pending).toBe(false);
  expect(sleep).toHaveBeenCalledTimes(1);
  expect(index.upsert).toHaveBeenCalledTimes(1);
  expect(index.delete).toHaveBeenCalledWith(['old'], { namespace: 'launcher-v2' });
});
it('外部嵌入只准备远端缺失的记录，无变化时不调用嵌入服务', async () => {
  const index = fakeIndex();
  const prepareAdditions = vi.fn(async rows => rows.map(({ data, ...row }) => ({ ...row, vector: [1, 2] })));
  await syncRecords(index, [record], 'launcher-v2', () => {}, undefined, { prepareAdditions });
  expect(index.upsert).toHaveBeenCalledWith([{ id: 'new', vector: [1, 2], metadata: { title: '世界' } }], { namespace: 'launcher-v2' });
  prepareAdditions.mockClear();
  const unchanged = fakeIndex(); unchanged.range.mockResolvedValue({ vectors: [{ id: 'new' }], nextCursor: '0' });
  await syncRecords(unchanged, [record], 'launcher-v2', () => {}, undefined, { prepareAdditions });
  expect(prepareAdditions).not.toHaveBeenCalled();
});
