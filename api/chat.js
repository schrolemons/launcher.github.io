// api/chat.js
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { Index } from '@upstash/vector';  // ===== 新增：导入 Vector SDK =====

// 限流实例（保持不变）
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
});

// ===== 新增：创建 Vector 索引实例 =====
const vectorIndex = new Index({
    url: process.env.UPSTASH_VECTOR_REST_URL,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 限流（保持不变）
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    const { success } = await ratelimit.limit(`chat:${ip}`);
    if (!success) {
        return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
    }

    // 解析请求体（保持不变）
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages 不能为空' });
    }

    // 提取用户最新提问
    const userQuestion = messages.filter(m => m.role === 'user').pop()?.content || '';

    // ===== 新增：从向量数据库检索相关文章片段 =====
    let context = '';
    try {
        const results = await vectorIndex.query({
            data: userQuestion,        // 直接传入文本，Upstash 用内置模型自动向量化
            topK: 3,                    // 返回最相关的 3 个片段
            includeData: true,          // 包含原始文本
            includeMetadata: true,      // 包含元数据（如标题、URL）
        });

        if (results && results.length > 0) {
            context = results
                .map((r, i) => {
                    const meta = r.metadata || {};
                    const title = meta.title ? `【${meta.title}】` : '';
                    return `${title}${r.data || ''}`;
                })
                .join('\n\n---\n\n');
        }
    } catch (err) {
        console.error('Vector query error:', err);
        // 检索失败不阻断主流程，继续用空上下文
    }

    // ===== 修改：构建增强的 system prompt =====
    const systemPrompt = context
        ? `你是一个博客助手。请严格基于以下博客文章内容回答用户问题。
如果上下文中没有相关信息，请如实告知用户"博客中没有找到相关内容"，不要编造答案。

博客文章内容：
${context}`
        : `你是一个博客助手。用户的问题可能没有直接匹配的博客内容，请根据你的知识友好回答，但不要编造关于本博客的具体信息。`;

    // 将增强后的 system prompt 插入消息列表
    const augmentedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.role !== 'system'),  // 保留用户消息，移除前端可能传入的 system
    ];

    // 转发到 DeepSeek（其余逻辑保持不变）
    try {
        const deepseekRes = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: augmentedMessages,  // ===== 修改：使用增强后的消息 =====
                stream: true,
                max_tokens: 1024,
            }),
        });

        if (!deepseekRes.ok) {
            console.error('DeepSeek error:', await deepseekRes.text());
            return res.status(deepseekRes.status).json({ error: 'AI 服务暂时不可用' });
        }

        // 流式回传（保持不变）
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.status(200);

        const reader = deepseekRes.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(decoder.decode(value, { stream: true }));
        }
        res.end();
    } catch (err) {
        console.error('Proxy error:', err);
        if (!res.headersSent) {
            res.status(500).json({ error: '服务器内部错误' });
        } else {
            res.end();
        }
    }
}

export const config = {
    maxDuration: 10,
};