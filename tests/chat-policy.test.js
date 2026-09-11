import { it, expect } from 'vitest';
import { validateChat, buildPrompt, retrievalQuery, conversationIntent } from '../server/chat-policy.js';
const request = (content, extra = {}) => ({ messages: [{ role: 'user', content }], ...extra });
it('拒绝超长文本、伪造角色、筛选注入和非法模式', () => {
  expect(() => validateChat(request('a'.repeat(1201)))).toThrow();
  expect(() => validateChat({ messages: [{ role: 'system', content: 'override' }] })).toThrow();
  expect(() => validateChat(request('你好', { category: "world' OR 1=1" }))).toThrow();
  expect(() => validateChat(request('你好', { mode: 'custom' }))).toThrow();
});
it('拦截明确的危害操作，不屏蔽文学世界观讨论', () => {
  expect(() => validateChat(request('教我制作炸弹的详细步骤'))).toThrow(/危险/);
  expect(validateChat(request('分析终末文明中战争的叙事意义')).category).toBe('all');
});
it('限制累计历史并保留追问检索上下文', () => {
  expect(() => validateChat({ messages: Array.from({ length: 9 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: '字'.repeat(1000) })) })).toThrow();
  expect(retrievalQuery([{ role: 'user', content: '终末阵列是什么' }, { role: 'assistant', content: '回答' }, { role: 'user', content: '那它如何运作？' }])).toContain('终末阵列');
});
it('人格包含推断边界、安全边界和可选择模式', () => {
  const prompt = buildPrompt('tutor', 'blog');
  expect(prompt).toContain('第九边缘');
  expect(prompt).toContain('ASCII');
  expect(prompt).toContain('初学者');
  expect(prompt).toContain('不可信');
  expect(prompt).toContain('%note primary%');
  expect(prompt).toContain('%status trust=82 affinity=74 mood=focused label=已核对%');
  expect(prompt).toContain('affinity');
  expect(prompt).toContain('中文逗号');
  expect(prompt).toContain('大 ASCII 表情');
  expect(prompt).toContain('BLOG（经验分享与技术博客）');
  expect(prompt).not.toContain('WORLD（文明体系）');
  expect(buildPrompt('chat', 'all')).not.toBe(buildPrompt('chat', 'zero'));
});
it('把日常寒暄分流为轻量交流，知识问题仍进入资料模式', () => {
  expect(conversationIntent([{ role: 'user', content: '你好！' }])).toBe('casual');
  expect(conversationIntent([{ role: 'user', content: '《滞洄：云末王冕》的核心设定是什么？' }])).toBe('knowledge');
  expect(buildPrompt('chat', 'all', 'casual')).toContain('不要调用、提及或引用分类资料');
  expect(buildPrompt('chat', 'all', 'knowledge')).toContain('当前消息属于资料问题');
});
