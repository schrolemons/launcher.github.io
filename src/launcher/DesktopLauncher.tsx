import { lazy, Suspense, useEffect, useState } from "react";
import type { LauncherProject } from "./types";

const LazyLauncherApp = lazy(() => import("./LauncherApp"));

export default function DesktopLauncher({ arkFeeds }: { arkFeeds?: LauncherProject["feeds"] }) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 900px)");
    const sync = () => setAllowed(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return allowed ? (
    <Suspense fallback={<div className="launcher-loading">正在装载启动器</div>}>
      <LazyLauncherApp arkFeeds={arkFeeds} />
    </Suspense>
  ) : null;
}
