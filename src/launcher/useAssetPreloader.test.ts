import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useAssetPreloader } from "./useAssetPreloader";

const images: HTMLImageElement[] = [];
const media: HTMLMediaElement[] = [];
beforeEach(() => {
  vi.useFakeTimers();
  images.length = 0;
  media.length = 0;
  vi.stubGlobal("Image", class { src = ""; onload = null; onerror = null; constructor() { images.push(this as unknown as HTMLImageElement); } });
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(function (this: HTMLMediaElement) { media.push(this); });
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe("desktop asset preloading", () => {
  it("makes no desktop media requests when disabled on mobile", () => {
    renderHook(() => useAssetPreloader(false));
    expect(images).toHaveLength(0);
    expect(media).toHaveLength(0);
  });

  it("still warms all project videos and treats music as audio", () => {
    renderHook(() => useAssetPreloader(true));
    expect(media.filter(el => el.tagName === "VIDEO").map(el => new URL(el.src).pathname)).toEqual(["/videos/ark.mp4", "/videos/blog.mp4", "/videos/world.mp4"]);
    expect(media.filter(el => el.tagName === "AUDIO")).toHaveLength(3);
    expect(images.some(el => el.src.endsWith(".mp3"))).toBe(false);
  });

  it("allows entry even if an image or media request never settles", async () => {
    const { result } = renderHook(() => useAssetPreloader(true));
    expect(result.current.ready).toBe(false);
    await act(async () => { await vi.advanceTimersByTimeAsync(15000); });
    expect(result.current.ready).toBe(true);
    expect(result.current.progress).toBe(1);
  });
});
