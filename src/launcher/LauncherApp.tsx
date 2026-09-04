import { useEffect, useRef, useState, type CSSProperties } from "react";
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
  const [activeId, setActiveId] = useState<ProjectId>("ark");
  const [mediaPaused, setMediaPaused] = useState(false);
  const [muted, setMuted] = useState(true);
  const [hasPlayableMedia, setHasPlayableMedia] = useState(false);
  const [openToolId, setOpenToolId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const activeProject = getProjectById(activeId);
  const displayedProject = activeProject.id === "ark" && arkFeeds ? { ...activeProject, feeds: arkFeeds } : activeProject;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (mediaPaused || muted) audio.pause();
  }, [mediaPaused, muted]);

  const selectProject = (projectId: ProjectId) => {
    setActiveId(projectId);
    setMediaPaused(false);
    setMuted(true);
    audioRef.current?.pause();
    setOpenToolId(null);
  };

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

  return (
    <div
      className="launcher-scene"
      style={{
        "--accent": displayedProject.accent,
        "--accent-soft": displayedProject.accentSoft,
      } as CSSProperties}
    >
      <div className="launcher-window">
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
          <div className="launcher-stage__content" data-playable-media={hasPlayableMedia}>
            <TopControls
              muted={muted}
              onToggleMuted={toggleMuted}
              onTogglePaused={togglePaused}
              paused={mediaPaused}
              playable={hasPlayableMedia}
              soundAvailable={Boolean(displayedProject.audio) || hasPlayableMedia}
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
              <InformationDock project={displayedProject} />
              <ProjectAction project={displayedProject} />
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
