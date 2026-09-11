import fs from 'node:fs';
import { collectRecords, recommendations } from './vector-content.js';
import { fileURLToPath } from 'node:url';
const { records } = collectRecords(fileURLToPath(new URL('../src/content/', import.meta.url)));
const output = new URL('../src/launcher/generated/chat-suggestions.json', import.meta.url);
fs.mkdirSync(new URL('../src/launcher/generated/', import.meta.url), { recursive: true });
fs.writeFileSync(output, JSON.stringify(recommendations(records), null, 2) + '\n');
console.log('已从文章标题离线生成推荐问题；未调用模型。');
