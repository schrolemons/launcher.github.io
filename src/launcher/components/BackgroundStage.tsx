import { useEffect, useRef, useState } from "react";
import type { LauncherProject } from "../types";

type BackgroundStageProps = {
  project: LauncherProject;
  paused: boolean;
  muted: boolean;
  visible: boolean;
  onPlaybackAvailabilityChange: (available: boolean) => void;
};

export default function BackgroundStage({ project, paused, muted, visible, onPlaybackAvailabilityChange }: BackgroundStageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [posterFailed, setPosterFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const media = project.media;
  const isVideo = media.kind === "video";

  useEffect(() => {
    onPlaybackAvailabilityChange(isVideo && visible);
  }, [isVideo, visible, onPlaybackAvailabilityChange]);

  // 设置视频 src 并监听元数据就绪
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    const markReady = () => setReady(true);
    video.addEventListener("loadedmetadata", markReady, { once: true });
    video.src = media.src;
    video.load();

    return () => {
      video.removeEventListener("loadedmetadata", markReady);
      setReady(false);
    };
  }, [isVideo, media.src]);

  // 控制播放/暂停
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVideo) return;

    video.muted = muted;
    if (muted) video.setAttribute("muted", "");
    else video.removeAttribute("muted");

    if (paused || !visible) {
      video.pause();
      return;
    }
    if (!ready) return;

    const tryPlay = () => {
      const result = video.play();
      if (result && typeof result.catch === "function") result.catch(() => {});
    };
    tryPlay();

    const resume = () => tryPlay();
    window.addEventListener("pointerdown", resume, { once: true });
    window.addEventListener("keydown", resume, { once: true });
    window.addEventListener("touchstart", resume, { once: true });

    return () => {
      window.removeEventListener("pointerdown", resume);
      window.removeEventListener("keydown", resume);
      window.removeEventListener("touchstart", resume);
    };
  }, [isVideo, muted, paused, ready, visible]);

  const style: React.CSSProperties = {
    objectPosition: media.position,
    display: visible ? undefined : "none",
  };

  if (posterFailed) {
    return (
      <div
        className="launcher-stage__media launcher-stage__media--gradient"
        aria-label={`${project.code} 背景`}
        style={style}
      >
        <span>{project.code}</span>
      </div>
    );
  }

  if (media.kind === "image") {
    return (
      <img
        className="launcher-stage__media"
        src={media.src}
        alt={`${project.code} 背景`}
        style={style}
        onError={() => setPosterFailed(true)}
      />
    );
  }

  return (
    <video
      ref={videoRef}
      className="launcher-stage__media"
      data-testid="launcher-video"
      poster={media.poster}
      muted
      loop
      playsInline
      style={style}
    />
  );
}