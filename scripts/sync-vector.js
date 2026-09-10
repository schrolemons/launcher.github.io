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

// 简单的 front-matter 解析（如果你用 gray-matter 可以替换）


async function main() {
    if (!fs.existsSync(POSTS_DIR)) {
        console.error('文章目录不存在:', POSTS_DIR);
        process.exit(1);
    }

    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    console.log(`找到 ${files.length} 篇文章`);

    let totalChunks = 0;

    for (const file of files) {
        const filePath = path.join(POSTS_DIR, file);
        const raw = fs.readFileSync(filePath, 'utf-8');
        const { data: frontmatter, content: body } = matter(raw);
        const title = frontmatter.title || slug;

        // 按段落切分，过滤太短的段落
        const chunks = body
            .split(/\n\s*\n/)
            .map(p => p.trim())
            .filter(p => p.length > 50);

        const slug = file.replace(/\.md$/, '');

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
                await index.upsert(batch);
            }
            totalChunks += records.length;
            console.log(`✓ ${file} → ${records.length} 个片段`);
        }
    }

    console.log(`\n完成！共上传 ${totalChunks} 个片段到 Upstash Vector`);
}

main().catch(err => {
    console.error('同步失败:', err);
    process.exit(1);
});