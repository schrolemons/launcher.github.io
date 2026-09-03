import {defineConfig} from 'astro/config';
import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

// 为 HLS 相关文件补全正确的 Content-Type，避免开发服务器因未知扩展名返回空 Content-Type。
const hlsMimeTypes = {
    name: 'hls-mime-types',
    configureServer(server) {
        server.middlewares.use((req, res, next) => {
            const url = (req.url || '').split('?')[0];
            if (url.endsWith('.m3u8')) {
                res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
            } else if (url.endsWith('.ts') || url.endsWith('.ts1')) {
                res.setHeader('Content-Type', 'video/mp2t');
            }
            next();
        });
    },
};

// https://astro.build/config
export default defineConfig({
    devToolbar: { enabled: false },
    server: { host: '127.0.0.1', port: 4321 },
    markdown: {
        shikiConfig: {
            theme: "one-dark-pro",
        },
    },

    integrations: [react(), tailwind({applyBaseStyles: false})],
    
    // 添加以下配置以支持 GitHub Pages 部署
    // 将 'astro-arknights' 替换为你的仓库名称
    base: '',
    
    // 配置 Sass 使用现代 API
    vite: {
        plugins: [hlsMimeTypes],
        css: {
            preprocessorOptions: {
                scss: {
                    api: "modern"
                }
            }
        }
    }
});
