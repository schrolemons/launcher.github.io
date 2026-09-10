// scripts/sync-vector.js
import { Index } from '@upstash/vector';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 从环境变量读取 Upstash 凭证
const index = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');
const MAX_RETRIES = 5;

async function upsertWithRetry(batch, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            return await index.upsert(batch);
        } catch (err) {
            if (attempt === retries) throw err;
            const delay = Math.min(1000 * 2 ** attempt, 30000);
            console.warn(`  ⚠ upsert 失败 (第 ${attempt + 1}/${MAX_RETRIES} 次重试)，${delay / 1000}s 后重试...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

async function main() {
    if (!fs.existsSync(POSTS_DIR)) {
        console.error('文章目录不存在:', POSTS_DIR);
        process.exit(1);
    }

    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    console.log(`找到 ${files.length} 篇文章`);

    let totalChunks = 0;
    const failedFiles = [];

    for (const file of files) {
        try {
            const filePath = path.join(POSTS_DIR, file);
            const raw = fs.readFileSync(filePath, 'utf-8');
            const slug = file.replace(/\.md$/, '');
            const { data: frontmatter, content: body } = matter(raw);
            const title = frontmatter.title || slug;

            // 按段落切分，过滤太短的段落
            const chunks = body
                .split(/\n\s*\n/)
                .map(p => p.trim())
                .filter(p => p.length > 50);

            // 构造向量记录
            const records = chunks.map((chunk, i) => ({
                id: `${slug}-${i}`,
                data: chunk,
                metadata: {
                    title,
                    slug,
                    description: frontmatter.description || '',
                    date: frontmatter.date || '',
                    chunkIndex: i,
                },
            }));

            if (records.length > 0) {
                // 分批上传，每批最多 100 条
                for (let i = 0; i < records.length; i += 100) {
                    const batch = records.slice(i, i + 100);
                    await upsertWithRetry(batch);
                    // 批次间延迟，避免触发 Upstash 限流
                    if (i + 100 < records.length) {
                        await new Promise(resolve => setTimeout(resolve, 2000));
                    }
                }
                totalChunks += records.length;
                console.log(`✓ ${file} → ${records.length} 个片段`);
            }
        } catch (err) {
            console.error(`✗ ${file} 同步失败:`, err.message);
            failedFiles.push(file);
            // 文件间延迟更长，给限流窗口更多恢复时间
            await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // 文章间延迟，避免连续请求触发限流
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n完成！共上传 ${totalChunks} 个片段到 Upstash Vector`);
    if (failedFiles.length > 0) {
        console.warn(`\n以下 ${failedFiles.length} 个文件同步失败，请稍后重试:`);
        failedFiles.forEach(f => console.warn(`  - ${f}`));
    }
}

main().catch(err => {
    console.error('同步失败:', err);
    process.exit(1);
});