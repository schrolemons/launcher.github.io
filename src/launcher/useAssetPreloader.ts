import { useEffect, useState } from "react";
import { launcherProjects, launcherTools } from "./config";

function collectAllAssets(): string[] {
  const assets: string[] = [];

  for (const project of launcherProjects) {
    if (project.media.kind === "image") {
      assets.push(project.media.src);
    } else {
      assets.push(project.media.src);
      if (project.media.poster) assets.push(project.media.poster);
    }
    if (project.audio) assets.push(project.audio.src);
    for (const slide of project.slides) {
      assets.push(slide.image);
    }
  }

  for (const tool of launcherTools) {
    if ("qrImage" in tool && tool.qrImage) assets.push(tool.qrImage);
  }

  return [...new Set(assets)];
}

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

function preloadVideo(src: string): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    let settled = false;
    const done = () => { if (!settled) { settled = true; resolve(); } };
    video.onloadedmetadata = done;
    video.onerror = done;
    video.src = src;
    video.load();
    // 兜底超时，避免阻塞加载画面
    setTimeout(done, 12000);
  });
}

export function useAssetPreloader() {
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const assets = collectAllAssets();
    if (assets.length === 0) {
      setReady(true);
      setProgress(1);
      return;
    }

    let loaded = 0;
    const total = assets.length;

    const promises = assets.map((src) => {
      const p = src.endsWith(".mp4") ? preloadVideo(src) : preloadImage(src);
      return p.then(() => {
        loaded += 1;
        setProgress(loaded / total);
      });
    });

    Promise.all(promises).then(() => setReady(true));
  }, []);

  return { ready, progress };
}