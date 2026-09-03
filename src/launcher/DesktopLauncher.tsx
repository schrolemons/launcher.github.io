import { lazy, Suspense, useEffect, useState } from "react";
import { preloadLauncherAssets } from "./preload";
import type { LauncherProject } from "./types";

const LazyLauncherApp = lazy(() => import("./LauncherApp"));

const LOADING = <div className="launcher-loading" role="status">启动器加载中</div>;

export default function DesktopLauncher({ arkFeeds }: { arkFeeds?: LauncherProject["feeds"] }) {
  const [allowed, setAllowed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 900px)");
    const sync = () => setAllowed(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  // 桌面视口下先预加载所有首页图片与视频，加载完成后才进入启动器，否则停留在加载动画。
  useEffect(() => {
    if (!allowed || ready) return;

    let cancelled = false;
    preloadLauncherAssets().then(() => {
      if (!cancelled) setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [allowed, ready]);

  if (!allowed) return null;

  return ready ? (
    <Suspense fallback={LOADING}>
      <LazyLauncherApp arkFeeds={arkFeeds} />
    </Suspense>
  ) : (
    LOADING
  );
}
