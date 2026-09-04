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
  const audioRef = useRef<HTMLAudioElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const wheelLockTimer = useRef<number | undefined>(undefined);
  const activeProject = getProjectById(activeId);
  const displayedProject = activeProject.id === "ark" && arkFeeds ? { ...activeProject, feeds: arkFeeds } : activeProject;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (mediaPaused || muted || mediaMode === "image") audio.pause();
  }, [mediaPaused, muted, mediaMode]);

  const selectProject = useCallback((projectId: ProjectId) => {
    setActiveId(projectId);
    setMediaPaused(false);
    setMediaMode("video");
    audioRef.current?.pause();
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

      const index = launcherProjects.findIndex((project) => project.id === activeId);
      const nextIndex = Math.min(launcherProjects.length - 1, Math.max(0, index + (event.deltaY > 0 ? 1 : -1)));
      if (nextIndex === index) return;

      event.preventDefault();
      selectProject(launcherProjects[nextIndex].id);
      wheelLockTimer.current = window.setTimeout(() => {
        wheelLockTimer.current = undefined;
      }, 360);
    };

    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [activeId, selectProject]);

  const toggleMuted = () => {
    const nextMuted = !muted;
    setMuted(nextMuted);
    const audio = audioRef.current;
    if (!audio) return;
    if (nextMuted) audio.pause();
    else void audio.play().catch(() => setMuted(true));
  };

  const togglePaused = () => {
    const nextPaused = !mediaPaused;
    setMediaPaused(nextPaused);
    const audio = audioRef.current;
    if (!audio || muted) return;
    if (nextPaused) audio.pause();
    else void audio.play().catch(() => setMuted(true));
  };

  const toggleMediaMode = () => {
    const nextMode = mediaMode === "video" ? "image" : "video";
    setMediaMode(nextMode);
    if (nextMode === "image") audioRef.current?.pause();
  };

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
                ref={project.id === activeId ? audioRef : undefined}
                data-testid="launcher-audio"
                src={project.audio.src}
                loop={project.audio.loop}
                preload="auto"
                style={{ display: project.id === activeId ? undefined : "none" }}
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
