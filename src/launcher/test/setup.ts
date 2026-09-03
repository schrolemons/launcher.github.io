import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

Object.defineProperty(HTMLMediaElement.prototype, "play", {
  configurable: true,
  value: () => Promise.resolve(),
});
Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  configurable: true,
  value: () => {},
});

Object.defineProperty(document, "fullscreenElement", {
  configurable: true,
  get: () => null,
});
Object.defineProperty(HTMLElement.prototype, "requestFullscreen", {
  configurable: true,
  value: () => Promise.resolve(),
});
Object.defineProperty(document, "exitFullscreen", {
  configurable: true,
  value: () => Promise.resolve(),
});
