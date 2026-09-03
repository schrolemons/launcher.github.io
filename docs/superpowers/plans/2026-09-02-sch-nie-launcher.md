# SCH-NIE Project Launcher Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current root page with a desktop-only, data-driven launcher for ARK, BLOG, ZERO, and WORLD while preserving the existing project source outside the root entry point.

**Architecture:** Mount one React launcher island from a new minimal Astro layout. Keep all editable project and tool content in a typed configuration module, keep transient UI state inside `LauncherApp`, and isolate HLS media, feeds, tools, and shell controls in focused components. Small screens render a static access notice before the launcher and HLS modules are imported.

**Tech Stack:** Astro 4, React 18, TypeScript, Tailwind base styles, scoped launcher CSS, hls.js, Swiper 11, Vitest, jsdom, Testing Library

**Spec:** `docs/superpowers/specs/2026-09-02-sch-nie-launcher-design.md`

## Global Constraints

- ARK is first and selected by default.
- ARK reuses `/videos/PV04_landscape/PV04_landscape.m3u8` as a muted autoplay background.
- Project selection changes preview content only; the project-specific main action opens the external project in a new tab.
- Each project owns its `actionLabel`; no shared “连接网页” label is rendered.
- Tool entries support direct link, QR-only, and combined link-plus-QR modes without third-party QR services.
- No launcher subsystem fetches news or metadata from another SCH-NIE domain at runtime.
- Existing non-root routes and source remain in the repository but are not linked from the new root page.
- Viewports below 900 CSS pixels render a desktop-only notice and do not mount HLS or Swiper.
- External links use `target="_blank"` and `rel="noopener noreferrer"`.
- Reduced-motion users receive no autoplaying carousel and no large translate or scale animation.

---

## File Map

- `src/layouts/LauncherLayout.astro`: minimal document shell for the launcher; does not mount the legacy header, menu, toolbox, tracker, or owner panel.
- `src/pages/index.astro`: desktop gate and lazy client entry point.
- `src/launcher/DesktopLauncher.tsx`: media-query gate that dynamically imports the heavy launcher only on supported desktop viewports.
- `src/launcher/types.ts`: public configuration and component contract types.
- `src/launcher/config.ts`: the single user-editable source for projects, feeds, slides, colors, actions, and tools.
- `src/launcher/config.test.ts`: configuration integrity tests.
- `src/launcher/LauncherApp.tsx`: root launcher state and composition.
- `src/launcher/LauncherApp.test.tsx`: project-switch and shell-state tests.
- `src/launcher/components/BackgroundStage.tsx`: image, MP4, native HLS, hls.js, pause, and fallback behavior.
- `src/launcher/components/BackgroundStage.test.tsx`: media lifecycle tests.
- `src/launcher/components/ProjectRail.tsx`: project selection rail.
- `src/launcher/components/ProjectIdentity.tsx`: current project label block.
- `src/launcher/components/InformationDock.tsx`: carousel, feed tabs, and empty states.
- `src/launcher/components/InformationDock.test.tsx`: carousel and feed interaction tests.
- `src/launcher/components/ToolRail.tsx`: link, QR, and combined tool entries plus popover.
- `src/launcher/components/ToolRail.test.tsx`: tool-mode and dismissal tests.
- `src/launcher/components/TopControls.tsx`: domain label, mute, playback, and fullscreen controls.
- `src/launcher/components/ProjectAction.tsx`: project-specific outbound action and details disclosure.
- `src/launcher/components/LauncherIcon.tsx`: small dependency-free SVG icon set used by the shell.
- `src/launcher/launcher.css`: shell geometry, glass styling, animation, height compression, focus states, and mobile notice.
- `src/launcher/test/setup.ts`: jsdom shims for matchMedia, media, and fullscreen.
- `vitest.config.ts`: Vitest/jsdom configuration.
- `package.json`: test scripts and test dependencies.

---

### Task 1: Typed configuration and test harness

**Files:**
- Create: `src/launcher/types.ts`
- Create: `src/launcher/config.ts`
- Create: `src/launcher/config.test.ts`
- Create: `src/launcher/test/setup.ts`
- Create: `vitest.config.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `ProjectId`, `LauncherProject`, `LauncherTool`, `launcherProjects`, `launcherTools`, and `getProjectById(id: ProjectId): LauncherProject`.
- Produces: `pnpm test` and `pnpm test:watch` commands used by every later task.

- [ ] **Step 1: Add the test runner and DOM testing dependencies**

Run:

```powershell
pnpm add -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

Expected: `package.json` and `pnpm-lock.yaml` contain the new development dependencies.

- [ ] **Step 2: Add test scripts and Vitest configuration**

Add these scripts to `package.json`:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/launcher/test/setup.ts"],
    css: true,
  },
});
```

Create `src/launcher/test/setup.ts` with `@testing-library/jest-dom/vitest`, a deterministic `window.matchMedia`, no-op `HTMLMediaElement.play/pause`, and `document.fullscreenElement`/`requestFullscreen`/`exitFullscreen` shims.

- [ ] **Step 3: Write failing configuration tests**

Create `src/launcher/config.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getProjectById, launcherProjects, launcherTools } from "./config";

describe("launcher configuration", () => {
  it("keeps ARK first and maps the four public projects", () => {
    expect(launcherProjects.map((project) => project.id)).toEqual([
      "ark",
      "blog",
      "zero",
      "world",
    ]);
    expect(getProjectById("ark").media).toMatchObject({
      kind: "hls",
      src: "/videos/PV04_landscape/PV04_landscape.m3u8",
      autoplay: true,
      muted: true,
    });
  });

  it("gives every project an outbound URL and a distinct action label", () => {
    expect(new Set(launcherProjects.map((item) => item.actionLabel)).size).toBe(4);
    launcherProjects.forEach((item) => expect(new URL(item.url).protocol).toBe("https:"));
  });

  it("only exposes complete tool modes", () => {
    launcherTools.forEach((tool) => {
      if (tool.mode === "link") expect(tool.href).toBeTruthy();
      if (tool.mode === "qr") expect(tool.qrImage).toBeTruthy();
      if (tool.mode === "both") {
        expect(tool.href).toBeTruthy();
        expect(tool.qrImage).toBeTruthy();
      }
    });
  });
});
```

- [ ] **Step 4: Run the focused test and confirm the intended failure**

Run:

```powershell
pnpm test -- src/launcher/config.test.ts
```

Expected: FAIL because `src/launcher/config.ts` does not exist.

- [ ] **Step 5: Define the contracts and initial content**

In `src/launcher/types.ts`, define discriminated media and tool types:

```ts
export type ProjectId = "ark" | "blog" | "zero" | "world";
export type FeedKind = "announcement" | "news" | "information";

export type ProjectMedia =
  | { kind: "image"; src: string; poster?: string; position?: string }
  | { kind: "video" | "hls"; src: string; poster: string; position?: string; autoplay: boolean; muted: boolean };

export interface FeedItem {
  title: string;
  date: string;
  href?: string;
  tag?: string;
}

export interface LauncherSlide {
  title: string;
  image: string;
  href?: string;
}

export interface LauncherProject {
  id: ProjectId;
  name: string;
  code: string;
  description: string;
  url: string;
  actionLabel: string;
  accent: string;
  accentSoft: string;
  media: ProjectMedia;
  slides: LauncherSlide[];
  feeds: Record<FeedKind, FeedItem[]>;
}

export type LauncherTool = {
  id: string;
  label: string;
  description: string;
  icon: "monitor" | "github" | "wechat" | "link";
} & (
  | { mode: "link"; href: string; qrImage?: never }
  | { mode: "qr"; href?: never; qrImage: string }
  | { mode: "both"; href: string; qrImage: string }
);
```

In `src/launcher/config.ts`, define ARK, BLOG, ZERO, and WORLD in that order with these exact identity defaults:

| ID | Name | Code | Description | URL | Action | Accent | Accent soft | Initial media |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `ark` | `SCHNIE:ARK` | `ARK` | `POWERED BY SCHROLEMONS` | `https://ark.sch-nie.com/` | `进入方舟` | `#f4ee00` | `rgba(244, 238, 0, 0.22)` | HLS `/videos/PV04_landscape/PV04_landscape.m3u8`, poster `/images/index-bg.jpg` |
| `blog` | `SCHNIE:BLOG` | `BLOG` | `第九边缘博客 · 一种新的生命态度` | `https://blog.sch-nie.com/` | `阅读博客` | `#22bff2` | `rgba(34, 191, 242, 0.22)` | Image `/info-swiper/Blog.jpg` |
| `zero` | `Zero` | `ZERO` | `内容由站点维护者补充` | `https://zero.sch-nie.com/` | `抵达零点` | `#ff8a3d` | `rgba(255, 138, 61, 0.22)` | Image `/images/layout-bg.jpg` |
| `world` | `第九边缘：SCHNIE/生涅` | `WORLD` | `仅属于虚拟自我的具象世界` | `https://world.sch-nie.com/` | `探索世界` | `#b9a0ff` | `rgba(185, 160, 255, 0.22)` | Image `/info-swiper/UserDocumentation.jpg` |

Copy the existing three ARK information slides and the currently available local ARK feed entries into the config so the initial dock is populated; keep BLOG, ZERO, and WORLD feeds as empty arrays that exercise the stable empty state. Define GitHub as `link` and Monitor as `both`, with `/launcher/tools/monitor-qr.svg` as the Monitor QR path.

- [ ] **Step 6: Run the configuration tests**

Run:

```powershell
pnpm test -- src/launcher/config.test.ts
```

Expected: PASS with three tests.

- [ ] **Step 7: Commit the configuration foundation**

```powershell
git add package.json pnpm-lock.yaml vitest.config.ts src/launcher/types.ts src/launcher/config.ts src/launcher/config.test.ts src/launcher/test/setup.ts
git commit -m "test: add launcher configuration foundation"
```

---

### Task 2: Desktop shell, project rail, and mobile rejection

**Files:**
- Create: `src/layouts/LauncherLayout.astro`
- Create: `src/launcher/DesktopLauncher.tsx`
- Create: `src/launcher/LauncherApp.tsx`
- Create: `src/launcher/LauncherApp.test.tsx`
- Create: `src/launcher/components/ProjectRail.tsx`
- Create: `src/launcher/components/ProjectIdentity.tsx`
- Create: `src/launcher/components/LauncherIcon.tsx`
- Create: `src/launcher/launcher.css`
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `launcherProjects`, `LauncherProject`, and `ProjectId` from Task 1.
- Produces: `DesktopLauncher(): JSX.Element | null`, `LauncherApp(): JSX.Element`, `ProjectRail`, `ProjectIdentity`, `.launcher-mobile-block`, and the CSS custom properties `--accent`/`--accent-soft`.

- [ ] **Step 1: Write failing project-switch tests**

Create `src/launcher/LauncherApp.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import LauncherApp from "./LauncherApp";

describe("LauncherApp", () => {
  it("starts on ARK and switches preview identity without navigating", async () => {
    const user = userEvent.setup();
    render(<LauncherApp />);

    expect(screen.getByRole("heading", { name: "SCHNIE:ARK" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /选择 BLOG/ }));
    expect(screen.getByRole("heading", { name: "SCHNIE:BLOG" })).toBeInTheDocument();
    expect(screen.getByText("第九边缘博客")).toBeInTheDocument();
  });

  it("exposes distinct project actions", async () => {
    const user = userEvent.setup();
    render(<LauncherApp />);
    expect(screen.getByRole("link", { name: /进入方舟/ })).toHaveAttribute("href", "https://ark.sch-nie.com/");
    await user.click(screen.getByRole("button", { name: /选择 WORLD/ }));
    expect(screen.getByRole("link", { name: /探索世界/ })).toHaveAttribute("href", "https://world.sch-nie.com/");
  });
});
```

- [ ] **Step 2: Run the focused test and confirm the intended failure**

Run:

```powershell
pnpm test -- src/launcher/LauncherApp.test.tsx
```

Expected: FAIL because `LauncherApp` and its child components do not exist.

- [ ] **Step 3: Build the minimal launcher state and project rail**

Implement `LauncherApp` with this state boundary:

```tsx
const [activeId, setActiveId] = useState<ProjectId>("ark");
const activeProject = getProjectById(activeId);

return (
  <div
    className="launcher-scene"
    style={{
      "--accent": activeProject.accent,
      "--accent-soft": activeProject.accentSoft,
    } as React.CSSProperties}
  >
    <div className="launcher-window">
      <ProjectRail projects={launcherProjects} activeId={activeId} onSelect={setActiveId} />
      <main className="launcher-stage">
        <ProjectIdentity project={activeProject} />
      </main>
    </div>
  </div>
);
```

`ProjectRail` renders native buttons, `aria-pressed`, visible code labels, and a stable SCHNIE monogram. `ProjectIdentity` renders the project `name`, `code`, and `description` without reading global state.

- [ ] **Step 4: Replace the root layout without deleting legacy routes**

Create `LauncherLayout.astro` with metadata, `FontFace`, `Scrollbar`, responsive viewport metadata, and a plain `<slot />`; do not import legacy `Header`, `Menu`, `ToolBox`, `OwnerInfo`, `LineDecorator`, `PageTracker`, or `ScrollTip`.

Implement `DesktopLauncher` as a lightweight media-query gate. It must not import `LauncherApp` at module evaluation time:

```tsx
import { lazy, Suspense, useEffect, useState } from "react";

const LazyLauncherApp = lazy(() => import("./LauncherApp"));

export default function DesktopLauncher() {
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
      <LazyLauncherApp />
    </Suspense>
  ) : null;
}
```

Change `src/pages/index.astro` to render:

```astro
---
import LauncherLayout from "../layouts/LauncherLayout.astro";
import DesktopLauncher from "../launcher/DesktopLauncher";
---

<LauncherLayout title="SCHNIE // PROJECT LAUNCHER" description="SCH-NIE 项目启动器">
  <div class="launcher-mobile-block" aria-labelledby="desktop-only-title">
    <p class="launcher-mobile-block__eyebrow">SCHNIE // ACCESS GATE</p>
    <h1 id="desktop-only-title">请使用桌面设备访问</h1>
    <p>启动器目前面向宽屏设备开放。</p>
  </div>
  <div class="launcher-desktop-root">
    <DesktopLauncher client:only="react" />
  </div>
</LauncherLayout>
```

Use CSS media queries so `.launcher-desktop-root` is hidden below 900px and `.launcher-mobile-block` is hidden at or above 900px. Because only `DesktopLauncher` is eagerly loaded and it dynamically imports `LauncherApp` after the desktop query matches, rejected devices never initialize HLS or Swiper.

- [ ] **Step 5: Add the shell geometry and focus baseline**

In `launcher.css`, set a 100svh scene, a viewport-centered window with `clamp()` padding, a fixed-width project rail, `overflow: hidden`, glass border/shadow, visible `:focus-visible` outlines using `--accent`, and a height-compressed layout under `760px` viewport height. Add reduced-motion rules that set transition and animation duration to `0.01ms`.

- [ ] **Step 6: Run tests and production type/build checks**

Run:

```powershell
pnpm test -- src/launcher/LauncherApp.test.tsx
pnpm build
```

Expected: project-switch tests PASS; Astro check and production build PASS.

- [ ] **Step 7: Commit the interactive shell**

```powershell
git add src/layouts/LauncherLayout.astro src/pages/index.astro src/launcher/DesktopLauncher.tsx src/launcher/LauncherApp.tsx src/launcher/LauncherApp.test.tsx src/launcher/components/ProjectRail.tsx src/launcher/components/ProjectIdentity.tsx src/launcher/components/LauncherIcon.tsx src/launcher/launcher.css
git commit -m "feat: add desktop project launcher shell"
```

---

### Task 3: Background media lifecycle and fallback

**Files:**
- Create: `src/launcher/components/BackgroundStage.tsx`
- Create: `src/launcher/components/BackgroundStage.test.tsx`
- Modify: `src/launcher/LauncherApp.tsx`
- Modify: `src/launcher/launcher.css`

**Interfaces:**
- Consumes: `LauncherProject`, `ProjectMedia`, `activeProject`, `mediaPaused`, and `muted`.
- Produces: `BackgroundStage({ project, paused, muted, onPlaybackAvailabilityChange })` and `hasPlayableMedia` state for `TopControls`.

- [ ] **Step 1: Write failing media tests**

Create `src/launcher/components/BackgroundStage.test.tsx` with module-mocked `hls.js`:

```tsx
it("attaches ARK HLS, autoplays muted, and destroys the instance on project change", () => {
  const { rerender } = render(
    <BackgroundStage project={arkProject} paused={false} muted onPlaybackAvailabilityChange={vi.fn()} />
  );
  expect(hlsLoadSource).toHaveBeenCalledWith("/videos/PV04_landscape/PV04_landscape.m3u8");
  expect(hlsAttachMedia).toHaveBeenCalled();

  rerender(
    <BackgroundStage project={blogProject} paused={false} muted onPlaybackAvailabilityChange={vi.fn()} />
  );
  expect(hlsDestroy).toHaveBeenCalled();
});

it("shows the poster fallback after a media error", () => {
  render(<BackgroundStage project={arkProject} paused={false} muted onPlaybackAvailabilityChange={vi.fn()} />);
  fireEvent.error(screen.getByTestId("launcher-video"));
  expect(screen.getByRole("img", { name: /ARK 背景/ })).toHaveAttribute("src", "/images/index-bg.jpg");
});
```

- [ ] **Step 2: Run the focused test and confirm the intended failure**

Run:

```powershell
pnpm test -- src/launcher/components/BackgroundStage.test.tsx
```

Expected: FAIL because `BackgroundStage` does not exist.

- [ ] **Step 3: Implement image, video, and HLS branches**

Implement a keyed `BackgroundStage` that:

1. Resets `failed` on `project.id` change.
2. Renders an image directly for `kind: "image"`.
3. Uses native HLS when `video.canPlayType("application/vnd.apple.mpegurl")` succeeds.
4. Otherwise constructs `new Hls()`, calls `loadSource`, `attachMedia`, and destroys it in effect cleanup.
5. Synchronizes `video.muted`, calls `play()` only when `paused === false`, and catches rejected promises without throwing.
6. On media error, renders the poster; on poster error, renders a gradient with the project code.

- [ ] **Step 4: Compose the background and ambient page layer**

Mount `BackgroundStage` inside `.launcher-stage`. Add a separate blurred ambient layer based on the active project poster, a stage vignette, a bottom readability gradient, and `isolation: isolate` so overlays do not leak outside the launcher window.

- [ ] **Step 5: Run media and shell tests**

Run:

```powershell
pnpm test -- src/launcher/components/BackgroundStage.test.tsx src/launcher/LauncherApp.test.tsx
```

Expected: both suites PASS; no unhandled media promise appears in test output.

- [ ] **Step 6: Commit the media stage**

```powershell
git add src/launcher/components/BackgroundStage.tsx src/launcher/components/BackgroundStage.test.tsx src/launcher/LauncherApp.tsx src/launcher/launcher.css
git commit -m "feat: add launcher media backgrounds"
```

---

### Task 4: Information dock and project-scoped content

**Files:**
- Create: `src/launcher/components/InformationDock.tsx`
- Create: `src/launcher/components/InformationDock.test.tsx`
- Modify: `src/launcher/LauncherApp.tsx`
- Modify: `src/launcher/launcher.css`

**Interfaces:**
- Consumes: `LauncherProject.slides`, `LauncherProject.feeds`, `FeedKind`, and reduced-motion preference.
- Produces: `InformationDock({ project })`, internal `activeFeed`, and internal Swiper state reset by `project.id`.

- [ ] **Step 1: Write failing feed and carousel tests**

Create tests that assert the ARK announcement is initially visible, clicking the “新闻” tab displays ARK news, switching the `project` prop resets the active tab to “公告”, and an empty WORLD feed renders “内容由站点维护者补充” without changing dock height.

Use this core interaction:

```tsx
const user = userEvent.setup();
const { rerender } = render(<InformationDock project={arkProject} />);
await user.click(screen.getByRole("tab", { name: "新闻" }));
expect(screen.getByRole("tabpanel")).toHaveTextContent(arkProject.feeds.news[0].title);
rerender(<InformationDock project={worldProject} />);
expect(screen.getByRole("tab", { name: "公告" })).toHaveAttribute("aria-selected", "true");
```

- [ ] **Step 2: Run the focused test and confirm the intended failure**

Run:

```powershell
pnpm test -- src/launcher/components/InformationDock.test.tsx
```

Expected: FAIL because `InformationDock` does not exist.

- [ ] **Step 3: Implement feed tabs and list semantics**

Render a `tablist` with the fixed labels `公告`, `新闻`, and `资讯`. Render the chosen list in a `tabpanel`; each linked item is an anchor and each unlinked item is a plain article row. Reset `activeFeed` to `announcement` when `project.id` changes.

- [ ] **Step 4: Implement the project-scoped Swiper**

Use `Swiper` with `Autoplay` and `A11y`. Key it by `project.id`, disable autoplay when `matchMedia("(prefers-reduced-motion: reduce)").matches`, and show a fixed-size project-code placeholder when `slides` is empty. Each image receives the slide title as `alt` text.

- [ ] **Step 5: Place and scale the information dock**

Anchor the dock to the lower-left portion of the stage, reserve space for the right action, use a two-column cover/list layout at normal desktop height, and reduce cover width plus row gaps under 760px height. Keep the dock above the background gradient and below the project identity in stacking order.

- [ ] **Step 6: Run the information and shell tests**

Run:

```powershell
pnpm test -- src/launcher/components/InformationDock.test.tsx src/launcher/LauncherApp.test.tsx
```

Expected: PASS for tab switching, project reset, empty feeds, and shell switching.

- [ ] **Step 7: Commit the information dock**

```powershell
git add src/launcher/components/InformationDock.tsx src/launcher/components/InformationDock.test.tsx src/launcher/LauncherApp.tsx src/launcher/launcher.css
git commit -m "feat: add project information dock"
```

---

### Task 5: Tool rail, QR popover, controls, and project action

**Files:**
- Create: `src/launcher/components/ToolRail.tsx`
- Create: `src/launcher/components/ToolRail.test.tsx`
- Create: `src/launcher/components/TopControls.tsx`
- Create: `src/launcher/components/ProjectAction.tsx`
- Modify: `src/launcher/LauncherApp.tsx`
- Modify: `src/launcher/components/LauncherIcon.tsx`
- Modify: `src/launcher/launcher.css`
- Create: `public/launcher/tools/monitor-qr.svg`

**Interfaces:**
- Consumes: `launcherTools`, `LauncherTool`, active project URL/action label, `muted`, `mediaPaused`, and `hasPlayableMedia`.
- Produces: `ToolRail({ tools, openToolId, onOpenTool, onCloseTool })`, `TopControls({ projectUrl, muted, paused, playable, onToggleMuted, onTogglePaused })`, `ProjectAction({ project })`, an Escape-dismissible `ToolPopover`, and actual link/QR/both mode behavior.

- [ ] **Step 1: Write failing tool-mode tests**

Create `src/launcher/components/ToolRail.test.tsx`:

```tsx
it("renders direct links without opening a popover", () => {
  render(<ToolRail tools={[githubTool]} />);
  expect(screen.getByRole("link", { name: /GitHub/ })).toHaveAttribute("href", githubTool.href);
});

it("opens a combined QR card and keeps a direct visit action", async () => {
  const user = userEvent.setup();
  render(<ToolRail tools={[monitorTool]} />);
  await user.click(screen.getByRole("button", { name: /Monitor/ }));
  expect(screen.getByRole("img", { name: /Monitor 二维码/ })).toHaveAttribute("src", monitorTool.qrImage);
  expect(screen.getByRole("link", { name: "直接访问" })).toHaveAttribute("href", monitorTool.href);
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run the focused test and confirm the intended failure**

Run:

```powershell
pnpm test -- src/launcher/components/ToolRail.test.tsx
```

Expected: FAIL because `ToolRail` does not exist.

- [ ] **Step 3: Implement the three tool modes**

Render `link` mode as a direct anchor. Render `qr` and `both` as buttons that open `role="dialog"` popovers. The popover displays `qrImage`, label, description, and—only for `both`—a `直接访问` anchor. Close on Escape, backdrop click, close button, or selection of another tool. On QR image error, replace the image with “二维码图片不可用” and keep the direct link when present.

Create `public/launcher/tools/monitor-qr.svg` as a valid scannable QR code for `https://monitor.sch-nie.com/`:

```powershell
New-Item -ItemType Directory -Force 'public/launcher/tools' | Out-Null
pnpm dlx qrcode -t svg -o 'public/launcher/tools/monitor-qr.svg' 'https://monitor.sch-nie.com/'
```

This generates the asset locally and does not call a remote QR service. Keep a commented configuration example showing how the user can point `qrImage` to a future WeChat QR image under the same directory.

- [ ] **Step 4: Implement project action and details**

`ProjectAction` renders the exact `project.actionLabel`, an outbound-arrow icon, and a nearby circular details button. The main anchor uses `project.url`, `_blank`, and `noopener noreferrer`. The details button toggles a compact panel containing the project name, description, and domain; it does not duplicate the information dock.

- [ ] **Step 5: Implement domain, mute, playback, and fullscreen controls**

`TopControls` renders the current hostname and three buttons. It calls supplied mute/playback callbacks; disables playback for image projects; and runs:

```ts
async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
    setFullscreenError("");
  } catch {
    setFullscreenError("浏览器未允许全屏显示");
  }
}
```

Expose the error through a polite live region. Use real web controls only; do not render fake minimize, close, or account buttons.

- [ ] **Step 6: Wire controls into `LauncherApp`**

Add `muted`, `mediaPaused`, `hasPlayableMedia`, and active dialog state. Reset `mediaPaused` to `false` when changing projects and pass the current values into `BackgroundStage`, `TopControls`, `ToolRail`, and `ProjectAction`.

- [ ] **Step 7: Run component tests and build**

Run:

```powershell
pnpm test -- src/launcher/components/ToolRail.test.tsx src/launcher/LauncherApp.test.tsx
pnpm build
```

Expected: all tests PASS; Astro check and build PASS.

- [ ] **Step 8: Commit launcher controls and tools**

```powershell
git add src/launcher/components/ToolRail.tsx src/launcher/components/ToolRail.test.tsx src/launcher/components/TopControls.tsx src/launcher/components/ProjectAction.tsx src/launcher/components/LauncherIcon.tsx src/launcher/LauncherApp.tsx src/launcher/launcher.css public/launcher/tools/monitor-qr.svg
git commit -m "feat: add launcher tools and controls"
```

---

### Task 6: Visual integration, accessibility pass, and release verification

**Files:**
- Modify: `src/launcher/config.ts`
- Modify: `src/launcher/LauncherApp.tsx`
- Modify: `src/launcher/launcher.css`
- Modify: `src/launcher/*.test.tsx`
- Modify: `src/launcher/components/*.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: every launcher interface produced by Tasks 1–5.
- Produces: production-ready root launcher, configuration documentation, and recorded verification evidence.

- [ ] **Step 1: Add regression assertions for accessibility and outbound safety**

Extend tests to assert:

```tsx
expect(screen.getByRole("button", { name: /选择 ARK/ })).toHaveAttribute("aria-pressed", "true");
expect(screen.getByRole("link", { name: /进入方舟/ })).toHaveAttribute("target", "_blank");
expect(screen.getByRole("link", { name: /进入方舟/ })).toHaveAttribute("rel", "noopener noreferrer");
```

Add one test that tabs through project selection, feed tabs, tool controls, and the project action without encountering hidden popover content.

- [ ] **Step 2: Run the complete suite before final polish**

Run:

```powershell
pnpm test
```

Expected: PASS. If any regression assertion fails, correct the component contract before adjusting purely visual CSS.

- [ ] **Step 3: Complete the screenshot-matched visual system**

Polish `launcher.css` to provide:

- blurred ambient project background behind the window;
- 24–32px safe outer spacing on common desktop sizes;
- dark left rail, slim right rail, translucent bottom dock, and pill-shaped controls;
- active-project outline and glow driven by `--accent`;
- readable project identity against both dark and bright media;
- a large project-colored action pill in the lower-right;
- subtle noise/checker details built with CSS gradients rather than copied game assets;
- stable layouts at `1920x1080`, `1440x900`, `1366x768`, and short-height desktop windows.

- [ ] **Step 4: Document the user-editable surface**

Add a README section named `Launcher configuration` that links to `src/launcher/config.ts` and lists the exact fields users normally edit: `name`, `code`, `description`, `url`, `actionLabel`, `accent`, `media`, `slides`, `feeds`, `href`, and `qrImage`. Include the required static directories for background and QR images.

- [ ] **Step 5: Run automated release verification**

Run:

```powershell
pnpm test
pnpm build
git diff --check
```

Expected: all tests PASS, Astro check/build succeeds, and `git diff --check` emits no errors.

- [ ] **Step 6: Run desktop browser interaction checks**

Start the app:

```powershell
pnpm dev --host 127.0.0.1
```

At `1920x1080`, `1440x900`, and `1366x768`, verify all four project switches, ARK muted autoplay, media pause/resume, all three feed tabs, carousel controls, GitHub direct navigation target, Monitor QR popover, details disclosure, and fullscreen control. Inspect the console after each project switch and confirm there are no launcher-originated errors. Capture at least one full launcher screenshot at `1920x1080` and one at `1440x900` for visual comparison with the supplied references.

- [ ] **Step 7: Run mobile rejection checks**

At `390x844` and `820x1180`, verify only the desktop access notice is present, the DOM contains no launcher video element or Swiper root, and there is no horizontal or vertical overflow.

- [ ] **Step 8: Review the final working tree and commit**

Run:

```powershell
git status --short
git diff --stat HEAD
```

Confirm only launcher implementation, tests, documented configuration, and intended dependency files changed. Then commit:

```powershell
git add README.md src/pages/index.astro src/layouts/LauncherLayout.astro src/launcher public/launcher package.json pnpm-lock.yaml vitest.config.ts
git commit -m "feat: deliver SCH-NIE project launcher"
```
