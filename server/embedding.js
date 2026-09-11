const DEFAULT_URL = 'https://api.openai.com/v1/embeddings';
const MODES = ['external', 'upstash-data'];

export function embeddingMode() {
  const mode = process.env.VECTOR_EMBEDDING_MODE || 'upstash-data';
  if (!MODES.includes(mode)) throw new Error(`VECTOR_EMBEDDING_MODE must be ${MODES.join(' or ')}`);
  return mode;
}

/** Read settings at call time so the model/provider can change via env only. */
export function embeddingConfig() {
  const mode = embeddingMode();
  if (mode === 'upstash-data') return { mode, model: process.env.VECTOR_EMBEDDING_MODEL || '' };
  const model = String(process.env.VECTOR_EMBEDDING_MODEL || '').trim();
  if (!model) throw new Error('外部嵌入配置不完整，请检查模型标识、端点和密钥配置');
  const dimensionValue = String(process.env.VECTOR_EMBEDDING_DIMENSION || '').trim();
  const dimension = dimensionValue ? Number(dimensionValue) : undefined;
  if (dimensionValue && (!Number.isInteger(dimension) || dimension <= 0)) throw new Error('VECTOR_EMBEDDING_DIMENSION 必须是正整数');
  return { mode, model, url: process.env.VECTOR_EMBEDDING_URL || DEFAULT_URL,
    apiKey: process.env.VECTOR_EMBEDDING_API_KEY || process.env.OPENAI_API_KEY || '', dimension };
}

export async function embedTexts(texts, fetcher = fetch) {
  const config = embeddingConfig();
  if (config.mode !== 'external') throw new Error('当前嵌入模式不接受应用层向量请求');
  if (!Array.isArray(texts) || !texts.length || texts.length > 64) throw new Error('嵌入批次必须为 1–64 条');
  const headers = { 'Content-Type': 'application/json' };
  if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
  const response = await fetcher(config.url, { method: 'POST', headers,
    body: JSON.stringify({ model: config.model, input: texts, encoding_format: 'float' }) });
  if (!response.ok) throw new Error('Embedding service unavailable');
  const payload = await response.json();
  if (!Array.isArray(payload.data) || payload.data.length !== texts.length) throw new Error('Embedding response invalid');
  const vectors = [...payload.data].sort((a, b) => a.index - b.index).map(row => row.embedding);
  if (vectors.some(vector => !Array.isArray(vector) || vector.some(value => !Number.isFinite(value)))) throw new Error('Embedding response contains invalid vectors');
  const dimension = config.dimension || vectors[0]?.length;
  if (!dimension || vectors.some(vector => vector.length !== dimension)) throw new Error('Embedding response dimension mismatch');
  return vectors;
}
