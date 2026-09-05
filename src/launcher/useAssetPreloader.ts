import { useEffect, useState } from "react";
import { launcherProjects, launcherTools } from "./config";

// 桌面端仍预热全部项目，保证项目切换时可以立即使用已缓存的媒体。
function collectAllAssets(): string[] {
  const assets = ["/images/logo.png"];
  for (const project of launcherProjects) {
    assets.push(project.media.src);
    if (project.media.poster) assets.push(project.media.poster);
    if (project.audio) assets.push(project.audio.src);
    for (const slide of project.slides) assets.push(slide.image);
  }
  for (const tool of launcherTools) {
    if (tool.qrImage) assets.push(tool.qrImage);
  }
  return [...new Set(assets)];
}

export function useAssetPreloader(enabled = true) {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    setReady(false);
    setProgress(0);
    let disposed = false;
    let loaded = 0;
    const assets = collectAllAssets();
    const cleanups: Array<() => void> = [];

    const promises = assets.map((src) => new Promise<void>((resolve) => {
      const pathname = new URL(src, window.location.href).pathname;
      const kind = /\.(mp4|webm)$/i.test(pathname) ? "video" : /\.(mp3|ogg|wav)$/i.test(pathname) ? "audio" : "image";
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        if (!disposed) setProgress(++loaded / assets.length);
        resolve();
      };
      // 图片也需要兜底；网络请求挂起不能永久阻塞启动器。
      const timer = window.setTimeout(done, 12000);
      if (kind === "image") {
        const image = new Image();
        image.onload = done;
        image.onerror = done;
        image.src = src;
        cleanups.push(() => {
          image.onload = image.onerror = null;
          done();
          image.src = "";
        });
      } else {
        const media = document.createElement(kind);
        media.preload = "auto";
        media.muted = true;
        media.addEventListener("canplaythrough", done, { once: true });
        media.addEventListener("error", done, { once: true });
        media.src = src;
        media.load();
        cleanups.push(() => {
          media.removeEventListener("canplaythrough", done);
          media.removeEventListener("error", done);
          done();
          media.pause();
          media.removeAttribute("src");
          media.load();
        });
      }
    }));

    void Promise.all(promises).then(() => { if (!disposed) setReady(true); });
    return () => {
      disposed = true;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [enabled]);

  return { ready, progress };
}
