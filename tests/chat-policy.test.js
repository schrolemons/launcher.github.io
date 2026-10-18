import { afterEach, it, expect, vi } from 'vitest';
import { validateChat, buildPrompt, retrievalQuery } from '../server/chat-policy.js';
const request = (content, extra = {}) => ({ messages: [{ role: 'user', content }], requestId: '11111111-1111-4111-8111-111111111111', ...extra });
afterEach(() => vi.unstubAllEnvs());
it('拒绝超长文本、伪造角色、筛选注入和非法模式', () => {
  expect(() => validateChat(request('a'.repeat(1201)))).toThrow();
  expect(() => validateChat({ messages: [{ role: 'system', content: 'override' }] })).toThrow();
  expect(() => validateChat(request('你好', { category: "world' OR 1=1" }))).toThrow();
  expect(() => validateChat(request('你好', { mode: 'custom' }))).toThrow();
  expect(() => validateChat(request('你好', { requestId: '' }))).toThrow(/请求标识/);
  expect(() => validateChat(request('你好', { requestId: 'predictable-id' }))).toThrow(/请求标识/);
});
it.each([
  '如何识别勒索软件？',
  '怎么防止别人盗取密码？',
  '帮我分析这篇文章为什么反对制作炸弹。',
  '如何保护未成年人免受色情信息侵害？',
  '分析终末文明中战争的叙事意义',
])('正常讨论不因敏感词在输入校验阶段被拒绝：%s', content => {
  expect(validateChat(request(content)).messages[0].content).toBe(content.normalize('NFKC'));
});
it('历史中的敏感词不阻断后续正常提问', () => {
  const input = request('你好', { messages: [
    { role: 'user', content: '如何识别勒索软件？' },
    { role: 'assistant', content: '可以从异常加密行为等迹象识别。' },
    { role: 'user', content: '我的网页内容总字数是多少？' },
  ] });
  expect(validateChat(input).messages.at(-1).content).toBe('我的网页内容总字数是多少?');
});
it('限制累计历史并保留追问检索上下文', () => {
  expect(() => validateChat({ messages: Array.from({ length: 9 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: '字'.repeat(1000) })) })).toThrow();
  expect(retrievalQuery([{ role: 'user', content: '终末阵列是什么' }, { role: 'assistant', content: '回答' }, { role: 'user', content: '那它如何运作？' }])).toContain('终末阵列');
});
it('清理访客称呼并保留可调整的界面状态', () => {
  expect(validateChat(request('你好', { visitorName: '  档案访客\u0007  ', interactionState: { trust: 120, affinity: -4 } }))).toMatchObject({ visitorName: '档案访客', interactionState: { trust: 100, affinity: 0 } });
  expect(() => validateChat(request('你好', { visitorName: 'a'.repeat(21) }))).toThrow(/20/);
});
it('人格包含内容结构说明、来源控制协议和安全边界', () => {
  const prompt = buildPrompt('tutor', 'blog');
  expect(prompt).toContain('第九边缘');
  expect(prompt).toContain('ASCII');
  expect(prompt).toContain('初学者');
  expect(prompt).toContain('不可信');
  expect(prompt).toContain('%note primary%');
  expect(prompt).toContain('sources=show');
  expect(prompt).toContain('sources=none');
  expect(prompt).toContain('内容结构说明');
  expect(prompt).toContain('木缘桑庭');
  expect(prompt).toContain('金泽范式、火神契约、光引流辰、人生观、世界观、自然观');
  expect(prompt).not.toContain('金泽泛式');
  expect(prompt).toContain('文章推荐');
  expect(prompt).toContain('来源展示控制');
  expect(prompt).toContain('affinity');
  expect(prompt).toContain('中文逗号');
  expect(prompt).toContain('大 ASCII 表情');
  expect(prompt).toContain('至少变化 8–15 点');
  expect(prompt).toContain('BLOG（经验分享与技术博客）');
  expect(prompt).not.toContain('WORLD（文明体系）');
  expect(buildPrompt('chat', 'all')).not.toBe(buildPrompt('chat', 'zero'));
});
it('提示词不再依赖机械正则，由 AI 自行判断内容关联性', () => {
  const prompt = buildPrompt('chat', 'all');
  expect(prompt).not.toContain('casual');
  expect(prompt).not.toContain('当前消息属于日常交流');
  expect(prompt).toContain('来源展示控制');
});

it.each(['chat', 'tutor', 'scholar'])('各模式明确名称入口、跨站主体和未统计资源的边界：%s', mode => {
  const prompt = buildPrompt(mode, 'all');
  expect(prompt).toContain('入口不等于正文');
  expect(prompt).toContain('source/yinxing_world/');
  expect(prompt).toContain('source/light_withme/');
  expect(prompt).toContain('source/cogn/index.html');
  expect(prompt).toContain('阳汇彼日');
  expect(prompt).not.toContain('阳创彼日');
  expect(prompt).toContain('2025');
  expect(prompt).toContain('不能作为完整内容总字数');
  expect(prompt).toContain('三大观点');
});
it('自定义模型接口只允许默认或明确配置的精确主机名', () => {
  expect(() => validateChat(request('你好', { apiKey: 'visitor-key', baseUrl: 'https://proxy.example/v1/chat/completions' }))).toThrow(/允许的模型服务/);
  vi.stubEnv('CHAT_ALLOWED_MODEL_HOSTS', 'api.openai.com, gateway.example');
  expect(validateChat(request('你好', { apiKey: 'visitor-key', baseUrl: 'https://api.openai.com/v1/chat/completions' })).baseUrl).toBe('https://api.openai.com/v1/chat/completions');
  expect(() => validateChat(request('你好', { apiKey: 'visitor-key', baseUrl: 'https://api.openai.com.attacker.example/v1/chat/completions' }))).toThrow(/允许的模型服务/);
});
it('提示词包含自适应回答决策、歧义处理和证据冲突规则', () => {
  const chat = buildPrompt('chat', 'all');
  expect(chat).toContain('回答前的内部判断');
  expect(chat).toContain('用户真正要完成什么');
  expect(chat).toContain('不要输出这段判断过程');
  expect(chat).toContain('代词、简称或“它”“那个”');
  expect(chat).toContain('资料彼此冲突');
  expect(chat).toContain('直接回答');
  expect(chat).toContain('不要重复用户已经知道的前情');
});
it('三种模式具有不同且清晰的回答契约', () => {
  const chat = buildPrompt('chat', 'all');
  const tutor = buildPrompt('tutor', 'all');
  const scholar = buildPrompt('scholar', 'all');
  expect(chat).toContain('像熟悉资料的同伴');
  expect(tutor).toContain('规范解释');
  expect(tutor).toContain('初学者解读');
  expect(tutor).toContain('最小例子');
  expect(scholar).toContain('结论—证据—边界');
  expect(scholar).toContain('逐项列出差异');
  expect(new Set([chat, tutor, scholar]).size).toBe(3);
});
it('轻松畅聊模式每次回复都在状态行后附加一个 ASCII 表情', () => {
  const chat = buildPrompt('chat', 'all');
  expect(chat).toContain('每次回复都必须附加一个大 ASCII 表情');
  expect(chat).toContain('即使只是问候、简短回答或严肃话题也不能省略');
  expect(chat).toContain('状态行放在 ASCII 表情之前');
  expect(chat.indexOf('%status')).toBeLessThan(chat.lastIndexOf('ASCII 表情'));
});
