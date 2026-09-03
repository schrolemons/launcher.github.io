import { useState } from "react";
import LauncherIcon from "./LauncherIcon";

type TopControlsProps = {
  projectUrl: string;
  muted: boolean;
  paused: boolean;
  playable: boolean;
  soundAvailable?: boolean;
  onToggleMuted: () => void;
  onTogglePaused: () => void;
};

export default function TopControls({ projectUrl, muted, paused, playable, soundAvailable = playable, onToggleMuted, onTogglePaused }: TopControlsProps) {
  const [fullscreenError, setFullscreenError] = useState("");
  const hostname = new URL(projectUrl).hostname;

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
        <button
          aria-label={muted ? "取消静音" : "静音"}
          className="launcher-control"
          disabled={!soundAvailable}
          onClick={onToggleMuted}
          title={soundAvailable ? undefined : "当前项目没有可用音轨"}
          type="button"
        >
          <LauncherIcon name={muted ? "muted" : "volume"} />
        </button>
        <button aria-label={paused ? "播放" : "暂停"} className="launcher-control" disabled={!playable} onClick={onTogglePaused} title={playable ? undefined : "当前项目为静态背景，或浏览器不支持视频"} type="button">
          <LauncherIcon name={paused ? "play" : "pause"} />
        </button>
        <button aria-label="全屏" className="launcher-control" onClick={() => void toggleFullscreen()} type="button">
          <LauncherIcon name="fullscreen" />
        </button>
      </div>
      <p aria-live="polite" className="launcher-top-controls__status">{fullscreenError}</p>
    </header>
  );
}
