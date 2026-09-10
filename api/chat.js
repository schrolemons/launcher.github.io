// api/chat.js
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// ⚠️ 实例必须在 handler 外部创建，才能在热启动时复用
const redis = Redis.fromEnv();
const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'), // 每 IP 每分钟最多 10 次
});

export default async function handler(req, res) {
    // 只允许 POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // 限流：按 IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
    const { success } = await ratelimit.limit(`chat:${ip}`);
    if (!success) {
        return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
    }

    // 解析并校验请求体
    const { messages } = req.body || {};
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages 不能为空' });
    }

    // 限制输入长度，防止 Token 滥用
    if (JSON.stringify(messages).length > 4000) {
        return res.status(400).json({ error: '输入内容过长' });
    }

    try {
        // 转发到 DeepSeek，注入密钥
        const deepseekRes = await fetch('https://api.deepseek.com/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages,
                stream: true,
                max_tokens: 1024,
            }),
        });

        if (!deepseekRes.ok) {
            console.error('DeepSeek error:', await deepseekRes.text());
            return res.status(deepseekRes.status).json({ error: 'AI 服务暂时不可用' });
        }

        // 流式回传
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