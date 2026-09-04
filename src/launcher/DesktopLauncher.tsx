import { lazy, Suspense, useEffect, useState, type CSSProperties } from "react";
import type { LauncherProject } from "./types";
import { launcherProjects } from "./config";
import { useAssetPreloader } from "./useAssetPreloader";

const LazyLauncherApp = lazy(() => import("./LauncherApp"));

export default function DesktopLauncher({ arkFeeds }: { arkFeeds?: LauncherProject["feeds"] }) {
  const [allowed, setAllowed] = useState(false);
  const { ready, progress } = useAssetPreloader();
  const [showApp, setShowApp] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 900px)");
    const sync = () => setAllowed(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // 资产就绪后等待一帧再渲染，确保过渡平滑
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => setShowApp(true));
    return () => cancelAnimationFrame(id);
  }, [ready]);

  // 加载超过 5 秒仍未进入时，展示网络提示与项目兜底入口
  useEffect(() => {
    if (!allowed || showApp) return;
    const id = window.setTimeout(() => setTimedOut(true), 5000);
    return () => window.clearTimeout(id);
  }, [allowed, showApp]);

  if (!allowed) return null;

  if (!showApp) {
    return (
      <div className="launcher-loading" role="status" aria-label="资源加载中">
        <div className="launcher-loading__inner">
          <div className="launcher-loading__spinner" />
          <p className="launcher-loading__text">SCHNIE // 资源就绪中</p>
          <div className="launcher-loading__bar">
            <div className="launcher-loading__bar-fill" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          {timedOut && (
            <div className="launcher-loading__fallback" role="alert">
              <p className="launcher-loading__warning">请检查你的网络情况</p>
              <div className="launcher-loading__projects">
                {launcherProjects.map((project) => (
                  <a
                    key={project.id}
                    className="launcher-mobile-card"
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ "--card-accent": project.accent, "--card-accent-soft": project.accentSoft } as CSSProperties}
                  >
                    <div className="launcher-mobile-card__media">
                      {project.media.kind === "video" ? (
                        <img src={project.media.poster} alt="" loading="lazy" />
                      ) : (
                        <img src={project.media.src} alt="" loading="lazy" />
                      )}
                      <div className="launcher-mobile-card__media-overlay" />
                    </div>
                    <div className="launcher-mobile-card__body">
                      <span className="launcher-mobile-card__code">{project.code}</span>
                      <h3 className="launcher-mobile-card__name">{project.name}</h3>
                      <p className="launcher-mobile-card__desc">{project.description}</p>
                      <span className="launcher-mobile-card__action">
                        {project.actionLabel}
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={null}>
      <LazyLauncherApp arkFeeds={arkFeeds} />
    </Suspense>
  );
}