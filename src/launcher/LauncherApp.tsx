import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { getProjectById, launcherProjects, launcherTools } from "./config";
import BackgroundStage from "./components/BackgroundStage";
import ProjectIdentity from "./components/ProjectIdentity";
import InformationDock from "./components/InformationDock";
import ProjectRail from "./components/ProjectRail";
import ProjectAction from "./components/ProjectAction";
import ToolRail from "./components/ToolRail";
import TopControls from "./components/TopControls";
import type { LauncherProject, ProjectId } from "./types";
import "./launcher.css";

// 滚轮切换只在这些项目之间循环，ZERO 作为特殊项目不参与滚轮导航
const scrollableProjects = launcherProjects.filter((project) => project.id !== "zero");

export default function LauncherApp({ arkFeeds }: { arkFeeds?: LauncherProject["feeds"] }) {
  const [activeId, setActiveId] = useState<ProjectId>(() => {
    const param = new URLSearchParams(window.location.search).get("project");
    return launcherProjects.some((project) => project.id === param) ? (param as ProjectId) : "ark";
  });
  const [mediaPaused, setMediaPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [mediaMode, setMediaMode] = useState<"video" | "image">("video");
  const [hasPlayableMedia, setHasPlayableMedia] = useState(false);
  const [openToolId, setOpenToolId] = useState<string | null>(null);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const fadeRef = useRef<number | null>(null);
  const prevAudioIdRef = useRef<ProjectId | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const wheelLockTimer = useRef<number | undefined>(undefined);
  const activeProject = getProjectById(activeId);
  const displayedProject = activeProject.id === "ark" && arkFeeds ? { ...activeProject, feeds: arkFeeds } : activeProject;

  // 音频始终与背景视频同节奏播放：扬声器关闭时静音播放，开启时出声。
  // 切换项目/开关扬声器时通过音量渐变实现淡入淡出，但保持 audio 持续 play，不破坏音视频对齐。
  useEffect(() => {
    const shouldPlay = displayedProject.media.kind === "video" && mediaMode === "video" && !mediaPaused;

    // 取消上一次尚未完成的渐变，避免多个 rAF 循环叠加造成混响
    if (fadeRef.current != null) {
      cancelAnimationFrame(fadeRef.current);
      fadeRef.current = null;
    }

    const prevId = prevAudioIdRef.current;
    prevAudioIdRef.current = activeId;

    // 暂停既非当前也非“上一次”的音频，防止快速切换时遗留的音频继续播放
    launcherProjects.forEach((project) => {
      if (project.id === activeId || project.id === prevId) return;
      const el = audioRefs.current[project.id];
      if (el) {
        el.pause();
        el.muted = true;
        el.volume = 1;
      }
    });

    const activeEl = audioRefs.current[activeId];
    const prevEl = prevId && prevId !== activeId ? audioRefs.current[prevId] : null;

    // 暂停/图片模式下不渐变，立即暂停以保持与视频对齐
    if (!shouldPlay) {
      if (activeEl) {
        activeEl.pause();
        activeEl.muted = muted;
        activeEl.volume = 1;
      }
      if (prevEl) {
        prevEl.pause();
        prevEl.muted = true;
        prevEl.volume = 1;
      }
      return;
    }

    // active：保持播放（对齐视频）；prev：淡出后暂停
    const tracks = [];
    if (activeEl) tracks.push({ el: activeEl, wasAudible: !activeEl.muted, willBeAudible: !muted, keepPlaying: true });
    if (prevEl) tracks.push({ el: prevEl, wasAudible: !prevEl.muted, willBeAudible: false, keepPlaying: false });

    const finalize = (track: { el: HTMLAudioElement; keepPlaying: boolean; willBeAudible: boolean }) => {
      if (track.keepPlaying) {
        track.el.muted = !track.willBeAudible;
        track.el.volume = 1;
        const result = track.el.play();
        if (result && typeof result.catch === "function") result.catch(() => {});
      } else {
        track.el.pause();
        track.el.muted = true;
        track.el.volume = 1;
      }
    };

    // 无听感变化的直接落位（如静音下切换项目）
    tracks.filter((track) => track.wasAudible === track.willBeAudible).forEach(finalize);

    const fadeOutTracks = tracks.filter((track) => track.wasAudible && !track.willBeAudible);
    const fadeInTracks = tracks.filter((track) => !track.wasAudible && track.willBeAudible);

    // 淡入轨先静音播放，保持与视频进度一致，待淡出完成后再渐入
    fadeInTracks.forEach((track) => {
      track.el.muted = true;
      track.el.volume = 1;
      const result = track.el.play();
      if (result && typeof result.catch === "function") result.catch(() => {});
    });

    // 先淡出，再淡入（两阶段顺序执行）
    const FADE_MS = 420;
    const phases = [];
    if (fadeOutTracks.length) phases.push({ tracks: fadeOutTracks, to: 0 });
    if (fadeInTracks.length) phases.push({ tracks: fadeInTracks, to: 1 });

    if (phases.length === 0) return;

    let phaseIndex = 0;
    const runPhase = () => {
      if (phaseIndex >= phases.length) return;

      const phase = phases[phaseIndex];
      const startVolume = phase.tracks.map((track) => (track.el.muted ? 0 : track.el.volume));

      // 渐变期间用 volume 控制响度，因此先取消 muted 并确保播放
      phase.tracks.forEach((track) => {
        track.el.muted = false;
        const result = track.el.play();
        if (result && typeof result.catch === "function") result.catch(() => {});
      });

      const startTime = performance.now();
      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / FADE_MS);
        phase.tracks.forEach((track, index) => {
          track.el.volume = startVolume[index] + (phase.to - startVolume[index]) * progress;
        });

        if (progress < 1) {
          fadeRef.current = requestAnimationFrame(step);
          return;
        }

        fadeRef.current = null;
        phase.tracks.forEach(finalize);
        phaseIndex += 1;
        runPhase();
      };

      fadeRef.current = requestAnimationFrame(step);
    };

    runPhase();
  }, [activeId, displayedProject.media.kind, mediaMode, mediaPaused, muted]);

  const selectProject = useCallback((projectId: ProjectId) => {
    setActiveId(projectId);
    setOpenToolId(null);

    const url = new URL(window.location.href);
    url.searchParams.set("project", projectId);
    window.history.replaceState(null, "", url);
  }, []);

  // 滚轮：在信息区（公告/新闻/资讯 + 左侧图片框）之外，上下滚轮切换左侧项目目录
  useEffect(() => {
    const node = windowRef.current;
    if (!node) return;

    const onWheel = (event: WheelEvent) => {
      const target = event.target as Element | null;
      if (target?.closest(".information-dock, .launcher-tool-popover__backdrop, .launcher-tool-popover__zoom, .launcher-tool-popover")) return;
      if (Math.abs(event.deltaY) < 8 || wheelLockTimer.current !== undefined) return;

      const index = scrollableProjects.findIndex((project) => project.id === activeId);
      if (index < 0) return; // ZERO 不参与滚轮切换

      const nextIndex = Math.min(scrollableProjects.length - 1, Math.max(0, index + (event.deltaY > 0 ? 1 : -1)));
      if (nextIndex === index) return;

      event.preventDefault();
      selectProject(scrollableProjects[nextIndex].id);
      wheelLockTimer.current = window.setTimeout(() => {
        wheelLockTimer.current = undefined;
      }, 360);
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [activeId, selectProject]);

  const toggleMuted = () => setMuted((value) => !value);

  const togglePaused = () => setMediaPaused((value) => !value);

  const toggleMediaMode = () => setMediaMode((mode) => (mode === "video" ? "image" : "video"));

  return (
    <div
      className="launcher-scene"
      style={{
        "--accent": displayedProject.accent,
        "--accent-soft": displayedProject.accentSoft,
      } as CSSProperties}
    >
      <div className="launcher-window" ref={windowRef}>
        <ProjectRail projects={launcherProjects} activeId={activeId} onSelect={selectProject} />
        <main className="launcher-stage">
          <div className="launcher-stage__ambient" style={{ "--ambient-image": `url(${displayedProject.media.poster ?? displayedProject.media.src})` } as CSSProperties} />
          {launcherProjects.map((project) => (
            <BackgroundStage
              key={`media-${project.id}`}
              project={project}
              paused={mediaPaused || project.id !== activeId}
              muted={muted}
              visible={project.id === activeId}
              mediaMode={mediaMode}
              onPlaybackAvailabilityChange={project.id === activeId ? setHasPlayableMedia : () => {}}
            />
          ))}
          {launcherProjects.map((project) =>
            project.audio ? (
              <audio
                key={`audio-${project.id}`}
                ref={(el) => {
                  audioRefs.current[project.id] = el;
                }}
                data-testid="launcher-audio"
                src={project.audio.src}
                loop={project.audio.loop}
                preload="auto"
                muted
              />
            ) : null
          )}
          <div className="launcher-stage__vignette" />
          <div className="launcher-stage__readability" />
          <div className="launcher-stage__floor" />
          <div className="launcher-stage__content" data-playable-media={hasPlayableMedia && mediaMode === "video"}>
            <img className="launcher-brand-logo" src="/images/logo.png" alt="SCHNIE logo" />
            <TopControls
              mediaMode={mediaMode}
              mediaToggleable={displayedProject.media.kind === "video"}
              muted={muted}
              onToggleMediaMode={toggleMediaMode}
              onToggleMuted={toggleMuted}
              onTogglePaused={togglePaused}
              paused={mediaPaused}
              playable={hasPlayableMedia && mediaMode === "video"}
              soundAvailable={(Boolean(displayedProject.audio) || hasPlayableMedia) && mediaMode === "video"}
              projectUrl={displayedProject.url}
            />
            <section
              className="launcher-stage__hero launcher-project-visual"
              data-project-id={displayedProject.id}
              data-testid="launcher-hero"
              key={`hero-${displayedProject.id}`}
            >
              <ProjectIdentity project={displayedProject} />
            </section>
            <div className="launcher-stage__bottom" data-testid="launcher-bottom">
              <InformationDock key={`dock-${displayedProject.id}`} project={displayedProject} />
              <ProjectAction key={`action-${displayedProject.id}`} project={displayedProject} />
            </div>
          </div>
          <ToolRail
            accent={displayedProject.accent}
            accentSoft={displayedProject.accentSoft}
            onCloseTool={() => setOpenToolId(null)}
            onOpenTool={setOpenToolId}
            openToolId={openToolId}
            tools={launcherTools}
          />
        </main>
      </div>
    </div>
  );
}
