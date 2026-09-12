// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { TurnstileController } from './turnstile';

afterEach(() => { vi.unstubAllGlobals(); document.head.innerHTML = ''; });

it('每次执行获取单次令牌，并在复用组件前重置', async () => {
  let options: Record<string, unknown> = {};
  const api = {
    render: vi.fn((_container: HTMLElement, next: Record<string, unknown>) => { options = next; return 'widget-1'; }),
    execute: vi.fn(() => (options.callback as (token: string) => void)('verified-token')),
    reset: vi.fn(),
    remove: vi.fn(),
  };
  Object.assign(window, { turnstile: api });
  const controller = new TurnstileController();
  const container = document.createElement('div');
  await expect(controller.execute(container, 'site-key')).resolves.toBe('verified-token');
  await expect(controller.execute(container, 'site-key')).resolves.toBe('verified-token');
  expect(api.render).toHaveBeenCalledTimes(1);
  expect(api.reset).toHaveBeenCalledWith('widget-1');
  expect(api.execute).toHaveBeenCalledTimes(2);
  controller.dispose();
  expect(api.remove).toHaveBeenCalledWith('widget-1');
});

it('页面关闭时可以取消仍在等待的安全验证', async () => {
  const api = { render: vi.fn(() => 'widget-2'), execute: vi.fn(), reset: vi.fn(), remove: vi.fn() };
  Object.assign(window, { turnstile: api });
  const controller = new TurnstileController();
  const abort = new AbortController();
  const pending = (controller.execute as unknown as (container: HTMLElement, siteKey: string, signal: AbortSignal) => Promise<string>)(document.createElement('div'), 'site-key', abort.signal);
  abort.abort();
  const outcome = await Promise.race([pending.then(() => 'resolved', error => error.message), new Promise<string>(resolve => setTimeout(() => resolve('still-pending'), 20))]);
  expect(outcome).toBe('安全验证已取消');
});
