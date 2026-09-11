// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import { embedTexts, embeddingConfig, embeddingMode } from './embedding.js';
beforeEach(() => { vi.stubEnv('VECTOR_EMBEDDING_MODE', 'external'); vi.stubEnv('VECTOR_EMBEDDING_MODEL', 'embedding-test-model'); vi.stubEnv('VECTOR_EMBEDDING_URL', 'https://embedding.example/v1/embeddings'); vi.stubEnv('VECTOR_EMBEDDING_API_KEY', 'test-key'); vi.stubEnv('VECTOR_EMBEDDING_DIMENSION', '1'); });
it('使用运行时模型配置生成有序向量，不泄漏密钥', async () => {
  const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ index: 1, embedding: [2] }, { index: 0, embedding: [1] }] }), { status: 200 }));
  expect(await embedTexts(['a', 'b'], fetcher)).toEqual([[1], [2]]);
  expect(fetcher.mock.calls[0][0]).toBe('https://embedding.example/v1/embeddings');
  expect(fetcher.mock.calls[0][1].headers.Authorization).toBe('Bearer test-key');
  expect(JSON.parse(fetcher.mock.calls[0][1].body).model).toBe('embedding-test-model');
  expect(fetcher.mock.calls[0][1].body).not.toContain('test-key');
});
it('默认使用无需模型变量的 Upstash 模式，外部模型配置可随环境切换', () => {
  vi.stubEnv('VECTOR_EMBEDDING_MODE', '');
  expect(embeddingMode()).toBe('upstash-data');
  vi.stubEnv('VECTOR_EMBEDDING_MODE', 'external');
  expect(embeddingConfig().model).toBe('embedding-test-model');
  vi.stubEnv('VECTOR_EMBEDDING_MODEL', 'another-model');
  expect(embeddingConfig().model).toBe('another-model');
  vi.stubEnv('VECTOR_EMBEDDING_MODE', 'other');
  expect(() => embeddingMode()).toThrow();
});
