import { lazy, Suspense, useEffect, useState } from "react";
import type { LauncherProject } from "./types";
import { useAssetPreloader } from "./useAssetPreloader";

const LazyLauncherApp = lazy(() => import("./LauncherApp"));

export default function DesktopLauncher({ arkFeeds }: { arkFeeds?: LauncherProject["feeds"] }) {
  const [allowed, setAllowed] = useState(false);
  const { ready, progress } = useAssetPreloader();
  const [showApp, setShowApp] = useState(false);

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