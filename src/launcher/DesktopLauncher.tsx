import { lazy, Suspense, useEffect, useState } from "react";
import type { LauncherProject } from "./types";

const LazyLauncherApp = lazy(() => import("./LauncherApp"));

const LOADING = <div className="launcher-loading" role="status">启动器加载中</div>;

export default function DesktopLauncher({ arkFeeds }: { arkFeeds?: LauncherProject["feeds"] }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 900px)");
    const sync = () => setAllowed(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  if (!allowed) return null;

  return (
    <Suspense fallback={LOADING}>
      <LazyLauncherApp arkFeeds={arkFeeds} />
    </Suspense>
  );
}
