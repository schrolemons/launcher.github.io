import {defineConfig} from 'astro/config';
import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
    devToolbar: { enabled: false },
    server: { host: '127.0.0.1', port: 4321 },
    markdown: {
        shikiConfig: {
            theme: "one-dark-pro",
        },
    },

    integrations: [react()],
    
    // 添加以下配置以支持 GitHub Pages 部署
    // 将 'astro-arknights' 替换为你的仓库名称
    base: '',
    
    // 配置 Sass 使用现代 API
    vite: {
        css: {
            preprocessorOptions: {
                scss: {
                    api: "modern"
                }
            }
        }
    }
});
