import { useEffect, useRef, useState } from "react";
import type { LauncherProject } from "../types";

type BackgroundStageProps = {
  project: LauncherProject;
  paused: boolean;
  muted: boolean;
  onPlaybackAvailabilityChange: (available: boolean) => void;
};

export default function BackgroundStage({ project, paused, muted, onPlaybackAvailabilityChange }: BackgroundStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [posterFailed, setPosterFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const media = project.media;
  const isVideo = media.kind === "video";

  // 是否有可播放的媒体，用于启用/禁用顶部的播放、暂停按钮。
  useEffect(() => {
    onPlaybackAvailabilityChange(isVideo);
  }, [isVideo, onPlaybackAvailabilityChange]);

  // 普通 MP4 视频直接赋值 src，元数据就绪后开始播放。
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    const markReady = () => setReady(true);
    video.src = media.src;
    video.addEventListener("loadedmetadata", markReady, { once: true });

    return () => {
      video.removeEventListener("loadedmetadata", markReady);
      video.pause();
    };
  }, [isVideo, media]);

  // 自动播放：确保 muted/playsinline，就绪后调用 play()；若被浏览器策略拦截则在首次交互后重试。
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    video.muted = muted;
    // React 只设置 muted 属性（property），不渲染 muted HTML 属性；部分浏览器依赖该属性放行静音自动播放。
    if (muted) video.setAttribute("muted", "");
    else video.removeAttribute("muted");

    if (paused) {
      video.pause();
      return;
    }
    if (!ready) return;

    const tryPlay = () => {
      const result = video.play();
      if (result && typeof result.catch === "function") result.catch(() => {});
    };
    tryPlay();

    // 自动播放可能被浏览器拦截（例如首次访问尚未与页面交互），在首次点击/按键/触摸后重试。
    const resume = () => tryPlay();
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    window.addEventListener("touchstart", resume, { once: true });

    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      window.removeEventListener("touchstart", resume);
    };
  }, [isVideo, muted, paused, ready]);

  if (posterFailed) {
    return <div className="launcher-stage__media launcher-stage__media--gradient" aria-label={`${project.code} 背景`}><span>{project.code}</span></div>;
  }

  if (media.kind === "image") {
    return <img className="launcher-stage__media" src={media.src} alt={`${project.code} 背景`} style={{ objectPosition: media.position }} onError={() => setPosterFailed(true)} />;
  }

  return <video key={project.id} ref={videoRef} className="launcher-stage__media" data-testid="launcher-video" src={media.src} poster={media.poster} muted loop playsInline style={{ objectPosition: media.position }} />;
}
