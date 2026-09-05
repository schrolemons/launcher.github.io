import { useEffect, useState } from "react";
import LauncherIcon from "./LauncherIcon";

type TopControlsProps = {
  projectUrl: string;
  muted: boolean;
  paused: boolean;
  playable: boolean;
  soundAvailable?: boolean;
  mediaMode: "video" | "image";
  mediaToggleable: boolean;
  hideMediaControls?: boolean;
  onToggleMuted: () => void;
  onTogglePaused: () => void;
  onToggleMediaMode: () => void;
};

export default function TopControls({ projectUrl, muted, paused, playable, soundAvailable = playable, mediaMode, mediaToggleable, hideMediaControls = false, onToggleMuted, onTogglePaused, onToggleMediaMode }: TopControlsProps) {
  const [fullscreenError, setFullscreenError] = useState("");
  const [pausedHint, setPausedHint] = useState(false);
  const [fullscreen, setFullscreen] = useState(Boolean(document.fullscreenElement));
  const hostname = new URL(projectUrl).hostname;

  useEffect(() => {
    const sync = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  useEffect(() => {
    if (!(paused && playable && mediaMode === "video")) {
      setPausedHint(false);
      return;
    }

    const id = window.setTimeout(() => setPausedHint(true), 5000);
    return () => window.clearTimeout(id);
  }, [paused, playable, mediaMode]);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setFullscreenError("");
    } catch {
      setFullscreenError("浏览器未允许全屏显示");
    }
  }

  return (
    <header className="launcher-top-controls">
      <p className="launcher-top-controls__domain">{hostname}</p>
      <div className="launcher-top-controls__actions">
        {!hideMediaControls && <>
        <button
          aria-label={muted ? "取消静音" : "静音"}
          aria-pressed={!muted}
          data-tooltip={muted ? "开启声音" : "关闭声音"}
          className="launcher-control"
          disabled={!soundAvailable}
          onClick={onToggleMuted}
          title={soundAvailable ? undefined : "当前项目没有可用音轨"}
          type="button"
        >
          <LauncherIcon name={muted ? "muted" : "volume"} />
        </button>
        <button aria-label={paused ? "播放" : "暂停"} aria-pressed={paused} data-tooltip={paused ? "继续播放" : "暂停背景"} className={`launcher-control${pausedHint ? " launcher-control--hint" : ""}`} disabled={!playable} onClick={onTogglePaused} title={playable ? undefined : "当前项目为静态背景，或浏览器不支持视频"} type="button">
          <LauncherIcon name={paused ? "play" : "pause"} />
        </button>
        {mediaToggleable ? (
          <button aria-label={mediaMode === "video" ? "切换为图片背景" : "切换为视频背景"} data-tooltip={mediaMode === "video" ? "静态背景" : "动态背景"} className="launcher-control" onClick={onToggleMediaMode} type="button">
            <LauncherIcon name={mediaMode === "video" ? "image" : "video"} />
          </button>
        ) : null}
        </>}
        <button aria-label={fullscreen ? "退出全屏" : "全屏"} aria-pressed={fullscreen} data-tooltip={fullscreen ? "退出全屏" : "全屏显示"} className="launcher-control" onClick={() => void toggleFullscreen()} type="button">
          <LauncherIcon name="fullscreen" />
        </button>
      </div>
      <p aria-live="polite" className="launcher-top-controls__status">{fullscreenError}</p>
    </header>
  );
}
