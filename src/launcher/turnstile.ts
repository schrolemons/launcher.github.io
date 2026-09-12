type TurnstileOptions = {
  sitekey: string;
  action: string;
  theme: 'dark';
  language: string;
  size: 'flexible';
  execution: 'execute';
  appearance: 'interaction-only';
  'response-field': false;
  callback: (token: string) => void;
  'error-callback': () => void;
  'expired-callback': () => void;
  'timeout-callback': () => void;
};

type TurnstileApi = {
  render(container: HTMLElement, options: TurnstileOptions): string;
  execute(widgetId: string): void;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
};

declare global { interface Window { turnstile?: TurnstileApi } }

let apiPromise: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (apiPromise) return apiPromise;
  const pending = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('安全验证组件未就绪'));
    script.onerror = () => reject(new Error('安全验证组件加载失败'));
    document.head.appendChild(script);
  });
  apiPromise = pending.catch(error => { apiPromise = null; throw error; });
  return apiPromise;
}

export class TurnstileController {
  private api: TurnstileApi | null = null;
  private widgetId: string | null = null;
  private pending: { resolve: (token: string) => void; reject: (error: Error) => void; cleanup: () => void } | null = null;

  private resolve(token: string) {
    const current = this.pending;
    this.pending = null;
    current?.cleanup();
    current?.resolve(token);
  }

  private reject(message: string) {
    const current = this.pending;
    this.pending = null;
    current?.cleanup();
    current?.reject(new Error(message));
  }

  async execute(container: HTMLElement, siteKey: string, signal?: AbortSignal): Promise<string> {
    if (!siteKey) throw new Error('安全验证站点密钥未配置');
    if (this.pending) throw new Error('安全验证正在进行');
    if (signal?.aborted) throw new Error('安全验证已取消');
    this.api = await loadTurnstile();
    if (signal?.aborted) throw new Error('安全验证已取消');
    return new Promise<string>((resolve, reject) => {
      const aborted = () => this.reject('安全验证已取消');
      signal?.addEventListener('abort', aborted, { once: true });
      this.pending = { resolve, reject, cleanup: () => signal?.removeEventListener('abort', aborted) };
      if (!this.widgetId) {
        this.widgetId = this.api!.render(container, {
          sitekey: siteKey, action: 'chat', theme: 'dark', language: 'zh-CN', size: 'flexible', execution: 'execute', appearance: 'interaction-only', 'response-field': false,
          callback: token => this.resolve(token),
          'error-callback': () => this.reject('安全验证组件连接失败'),
          'expired-callback': () => this.reject('安全验证已过期，请重试'),
          'timeout-callback': () => this.reject('安全验证超时，请重试'),
        });
      } else {
        this.api!.reset(this.widgetId);
      }
      this.api!.execute(this.widgetId);
    });
  }

  dispose() {
    this.reject('安全验证已取消');
    if (this.api && this.widgetId) this.api.remove(this.widgetId);
    this.widgetId = null;
  }
}
