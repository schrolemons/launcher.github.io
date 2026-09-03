# SCH-NIE Launcher Commercial Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing SCH-NIE desktop launcher prototype into a stable, full-viewport, commercially presentable launcher matching the approved reference proportions and interaction quality.

**Architecture:** Keep `LauncherApp` as the single state owner, but divide the stage into explicit top, hero, bottom, and right-rail layout zones. Make HLS capability and readiness explicit inside `BackgroundStage`; make `InformationDock` render a fixed number of visible rows; keep tool behavior controlled while replacing text pills and glyphs with a dedicated icon rail and SVG icon system.

**Tech Stack:** Astro 4, React 18, TypeScript, Vitest, Testing Library, hls.js, Swiper 11, CSS.

**Spec:** `docs/superpowers/specs/2026-09-02-sch-nie-launcher-design.md`

## Global Constraints

- Work in the user-authorized current `main` checkout and do not push.
- The launcher is desktop-only at `min-width: 900px`; smaller viewports render only the existing lightweight desktop-access notice and must not initialize HLS or Swiper.
- ARK remains the initial project and uses only `/videos/PV04_landscape/PV04_landscape.m3u8`; do not generate, store, or load an MP4 fallback.
- If neither native HLS nor Media Source Extensions through hls.js is available, render `/images/index-bg.jpg` and expose playback as unavailable.
- Images, posters, and video use `object-fit: cover`; project-specific focal positioning remains configurable through `media.position`.
- The announcement, news, and information tabs must keep the same outer geometry. Render no more than three visible feed rows so overflow cannot add focusable off-screen content.
- The `1920x1080`, `1440x900`, and `1366x768` desktop layouts use 24–32px outer safe spacing, fill the remaining viewport, and produce no page scroll.
- The right rail is an icon-first vertical control strip with accessible names, hover/focus tooltips, QR popover support, and safe direct links.
- The upper-left brand reads `SCHNIE` with `PROJECTS`; do not reuse the incomplete `S/` mark.
- Entrance, project-switch, identity, accent, and dock-content animations must be perceptible in normal motion mode and disabled or reduced under `prefers-reduced-motion: reduce`.
- Do not copy logos or UI assets from the reference launcher; use project-owned media, CSS effects, and repository-native SVG icons.
- Preserve all non-launcher routes and unrelated working-tree changes.

---

### Task 1: Reliable HLS capability and autoplay lifecycle

**Files:**
- Modify: `src/launcher/components/BackgroundStage.tsx`
- Modify: `src/launcher/components/BackgroundStage.test.tsx`

**Interfaces:**
- Consumes: `BackgroundStageProps` and `LauncherProject.media` as already defined.
- Produces: HLS capability-aware poster fallback and `onPlaybackAvailabilityChange(available: boolean)` that becomes true only when a video path is usable.

- [ ] **Step 1: Add failing HLS capability and readiness tests**

Extend the hls.js mock with `isSupported` and `MANIFEST_PARSED`, then add these behavior assertions:

```tsx
const hlsIsSupported = vi.fn(() => true);

vi.mock("hls.js", () => ({
  default: class Hls {
    static Events = { ERROR: "hlsError", MANIFEST_PARSED: "manifestParsed" };
    static isSupported = hlsIsSupported;
    // existing instance spies remain unchanged
  },
}));

it("uses the poster without constructing HLS when playback is unsupported", () => {
  hlsIsSupported.mockReturnValue(false);
  const availability = vi.fn();
  render(<BackgroundStage project={arkProject} paused={false} muted onPlaybackAvailabilityChange={availability} />);
  expect(screen.queryByTestId("launcher-video")).not.toBeInTheDocument();
  expect(screen.getByRole("img", { name: /ARK 背景/ })).toHaveAttribute("src", "/images/index-bg.jpg");
  expect(hlsLoadSource).not.toHaveBeenCalled();
  expect(availability).toHaveBeenLastCalledWith(false);
});

it("starts muted playback after the HLS manifest is ready", () => {
  const play = vi.spyOn(HTMLMediaElement.prototype, "play");
  render(<BackgroundStage project={arkProject} paused={false} muted onPlaybackAvailabilityChange={vi.fn()} />);
  const manifestHandler = hlsOn.mock.calls.find(([event]) => event === "manifestParsed")?.[1];
  act(() => manifestHandler?.());
  expect(play).toHaveBeenCalled();
});
```

- [ ] **Step 2: Run the focused test and record the expected RED**

Run: `pnpm test -- src/launcher/components/BackgroundStage.test.tsx`

Expected: FAIL because the mock has no production `Hls.isSupported()` branch and playback currently happens before the manifest is ready.

- [ ] **Step 3: Implement capability-aware HLS setup**

Use this lifecycle shape in `BackgroundStage.tsx`:

```tsx
const playWhenAllowed = () => {
  if (!paused) void video.play().catch(() => undefined);
};

if (media.kind === "hls") {
  const nativeHls = Boolean(video.canPlayType("application/vnd.apple.mpegurl"));
  if (nativeHls) {
    video.src = media.src;
    video.addEventListener("loadedmetadata", playWhenAllowed, { once: true });
  } else if (Hls.isSupported()) {
    hls = new Hls();
    hls.on(Hls.Events.MANIFEST_PARSED, playWhenAllowed);
    hls.on(Hls.Events.ERROR, onHlsError);
    hls.loadSource(media.src);
    hls.attachMedia(video);
  } else {
    setUnsupported(true);
  }
}
```

Reset `unsupported` on project change, remove both listeners during cleanup, and render the poster when `unsupported || failed`. Ordinary MP4 project support remains intact, but no MP4 is added to ARK.

- [ ] **Step 4: Run focused and full tests**

Run: `pnpm test -- src/launcher/components/BackgroundStage.test.tsx`

Expected: PASS, including unsupported fallback, manifest-ready autoplay, fatal error fallback, image fallback, and cleanup.

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/launcher/components/BackgroundStage.tsx src/launcher/components/BackgroundStage.test.tsx
git commit -m "fix: stabilize launcher HLS playback"
```

---

### Task 2: Full-viewport stage, complete branding, and coordinated motion

**Files:**
- Modify: `src/launcher/LauncherApp.tsx`
- Modify: `src/launcher/LauncherApp.test.tsx`
- Modify: `src/launcher/components/ProjectRail.tsx`
- Modify: `src/launcher/launcher.css`

**Interfaces:**
- Consumes: the existing `ProjectRail`, `ProjectIdentity`, `InformationDock`, `ProjectAction`, `TopControls`, and `ToolRail` interfaces.
- Produces: `.launcher-stage__hero`, `.launcher-stage__bottom`, `.launcher-project-visual`, and the complete `SCHNIE / PROJECTS` brand block used by the visual system.

- [ ] **Step 1: Add failing semantic structure tests**

Add assertions to `LauncherApp.test.tsx`:

```tsx
it("renders the complete launcher brand and stable layout regions", () => {
  render(<LauncherApp />);
  expect(screen.getByText("SCHNIE")).toBeInTheDocument();
  expect(screen.getByText("PROJECTS")).toBeInTheDocument();
  expect(screen.getByTestId("launcher-hero")).toHaveAttribute("data-project-id", "ark");
  expect(screen.getByTestId("launcher-bottom")).toContainElement(screen.getByTestId("information-dock"));
});
```

- [ ] **Step 2: Run the focused test and record the expected RED**

Run: `pnpm test -- src/launcher/LauncherApp.test.tsx`

Expected: FAIL because the complete brand and explicit layout regions do not exist.

- [ ] **Step 3: Introduce explicit layout regions**

Replace the monogram-only rail header with:

```tsx
<div className="launcher-rail__brand" aria-label="SCHNIE Projects">
  <span className="launcher-rail__wordmark">SCHNIE</span>
  <span className="launcher-rail__brand-subtitle">PROJECTS</span>
</div>
```

Organize the stage content without changing state ownership:

```tsx
<div className="launcher-stage__content" data-playable-media={hasPlayableMedia}>
  <TopControls {...controlProps} />
  <section className="launcher-stage__hero launcher-project-visual" data-project-id={activeProject.id} data-testid="launcher-hero" key={`hero-${activeProject.id}`}>
    <ProjectIdentity project={activeProject} />
  </section>
  <div className="launcher-stage__bottom" data-testid="launcher-bottom">
    <InformationDock project={activeProject} />
    <ProjectAction project={activeProject} />
  </div>
</div>
```

- [ ] **Step 4: Replace the compact prototype geometry with viewport-based CSS**

Implement these governing rules and adapt the existing selectors around them:

```css
.launcher-scene { height: 100svh; min-height: 0; overflow: hidden; padding: clamp(1.5rem, 2vw, 2rem); }
.launcher-window { width: 100%; max-width: none; height: 100%; max-height: none; grid-template-columns: clamp(7.5rem, 8vw, 9.5rem) minmax(0, 1fr); }
.launcher-stage { display: block; padding: 0; }
.launcher-stage__content { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; height: 100%; min-height: 0; padding: clamp(1.25rem, 2.4vw, 2.75rem) clamp(5rem, 6vw, 7rem) clamp(1.25rem, 2.2vw, 2.5rem) clamp(1.5rem, 3vw, 3.5rem); }
.launcher-stage__hero { align-self: center; min-width: 0; }
.launcher-stage__bottom { align-items: end; display: grid; gap: clamp(1.25rem, 2vw, 2.25rem); grid-template-columns: minmax(0, 52rem) minmax(13rem, 1fr); }
```

Add `launcher-window-enter`, `launcher-media-enter`, `launcher-identity-enter`, `launcher-feed-enter`, `launcher-accent-pulse`, and project-switch keyframes. Use `animation` on stable wrapper classes and disable them in the existing reduced-motion media query.

- [ ] **Step 5: Run focused tests and build**

Run: `pnpm test -- src/launcher/LauncherApp.test.tsx`

Expected: PASS.

Run: `pnpm build`

Expected: `astro check` reports 0 errors and the production build completes.

- [ ] **Step 6: Commit**

```powershell
git add src/launcher/LauncherApp.tsx src/launcher/LauncherApp.test.tsx src/launcher/components/ProjectRail.tsx src/launcher/launcher.css
git commit -m "feat: rebuild launcher stage composition"
```

---

### Task 3: Fixed information dock with clipped visible rows

**Files:**
- Modify: `src/launcher/components/InformationDock.tsx`
- Modify: `src/launcher/components/InformationDock.test.tsx`
- Modify: `src/launcher/launcher.css`

**Interfaces:**
- Consumes: `LauncherProject.slides` and `LauncherProject.feeds`.
- Produces: `MAX_VISIBLE_FEED_ITEMS = 3`, fixed-height tab panels, and keyboard arrow navigation among the three feed tabs.

- [ ] **Step 1: Add failing row-limit and keyboard tests**

Add to `InformationDock.test.tsx`:

```tsx
it("renders no more than three visible feed rows", async () => {
  const user = userEvent.setup();
  render(<InformationDock project={arkProject} />);
  await user.click(screen.getByRole("tab", { name: "新闻" }));
  expect(screen.getAllByRole("link", { name: /事件/ })).toHaveLength(3);
  expect(screen.queryByText("01云末王冕")).not.toBeInTheDocument();
});

it("moves between feed tabs with arrow keys without changing dock geometry", async () => {
  const user = userEvent.setup();
  render(<InformationDock project={arkProject} />);
  const announcement = screen.getByRole("tab", { name: "公告" });
  announcement.focus();
  await user.keyboard("{ArrowRight}");
  expect(screen.getByRole("tab", { name: "新闻" })).toHaveFocus();
  expect(screen.getByRole("tab", { name: "新闻" })).toHaveAttribute("aria-selected", "true");
});
```

- [ ] **Step 2: Run the focused test and record the expected RED**

Run: `pnpm test -- src/launcher/components/InformationDock.test.tsx`

Expected: FAIL because all news rows render and arrow keys do not switch tabs.

- [ ] **Step 3: Limit content and implement roving tab behavior**

Add:

```tsx
export const MAX_VISIBLE_FEED_ITEMS = 3;
const visibleFeed = feed.slice(0, MAX_VISIBLE_FEED_ITEMS);

const selectRelativeTab = (current: FeedKind, offset: number) => {
  const index = feedTabs.findIndex((tab) => tab.kind === current);
  const next = feedTabs[(index + offset + feedTabs.length) % feedTabs.length];
  setActiveFeed(next.kind);
  document.getElementById(`${tabId}-${next.kind}`)?.focus();
};
```

Handle `ArrowLeft`, `ArrowRight`, `Home`, and `End` on each tab. Render `visibleFeed`, assign `tabIndex={selected ? 0 : -1}`, and keep the active panel keyed by project and feed so only its content fades.

- [ ] **Step 4: Fix the dock dimensions and overflow in CSS**

Use fixed geometry at each desktop height class:

```css
.information-dock { height: clamp(12rem, 22vh, 15rem); min-height: 0; overflow: hidden; }
.information-dock__cover,
.information-dock__cover .swiper,
.information-dock__cover-placeholder { height: 100%; }
.information-dock__feeds { grid-template-rows: 3.5rem minmax(0, 1fr); overflow: hidden; }
.information-dock__feed-list { height: 100%; min-height: 0; overflow: hidden; }
.information-dock__feed-row { min-height: 3rem; }
```

- [ ] **Step 5: Run focused and full tests**

Run: `pnpm test -- src/launcher/components/InformationDock.test.tsx`

Expected: PASS.

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/launcher/components/InformationDock.tsx src/launcher/components/InformationDock.test.tsx src/launcher/launcher.css
git commit -m "fix: lock launcher information dock geometry"
```

---

### Task 4: Production icon rail and control surfaces

**Files:**
- Modify: `src/launcher/components/LauncherIcon.tsx`
- Modify: `src/launcher/components/ToolRail.tsx`
- Modify: `src/launcher/components/ToolRail.test.tsx`
- Modify: `src/launcher/components/TopControls.tsx`
- Modify: `src/launcher/components/TopControls.test.tsx`
- Modify: `src/launcher/launcher.css`

**Interfaces:**
- Consumes: the existing controlled `ToolRailProps`, `LauncherTool.icon`, and `TopControls` callback contract.
- Produces: a consistent inline-SVG icon component and icon-first rail items with `data-tooltip` labels.

- [ ] **Step 1: Add failing icon-rail semantics tests**

Add behavior assertions:

```tsx
expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute("data-tooltip", "GitHub");
expect(screen.getByRole("button", { name: "Monitor" })).toHaveAttribute("data-tooltip", "Monitor");
expect(screen.getByRole("link", { name: "GitHub" }).querySelector("svg")).not.toBeNull();
expect(screen.getByRole("button", { name: "Monitor" }).querySelector("svg")).not.toBeNull();
```

In `TopControls.test.tsx`, assert every control contains an `svg[aria-hidden="true"]` and still exposes its action through the button accessible name.

- [ ] **Step 2: Run focused tests and record the expected RED**

Run: `pnpm test -- src/launcher/components/ToolRail.test.tsx src/launcher/components/TopControls.test.tsx`

Expected: FAIL because current icons are text glyphs and rail items have no tooltip data.

- [ ] **Step 3: Replace glyphs with repository-native SVGs**

Make `LauncherIcon` return a uniform SVG shell:

```tsx
return (
  <svg aria-hidden="true" className={className} fill="none" focusable="false" viewBox="0 0 24 24">
    {iconPaths[name ?? "link"]}
  </svg>
);
```

Define compact `path`, `circle`, and `polyline` elements for every existing icon name using `stroke="currentColor"`, `strokeWidth="1.8"`, rounded caps, and no external icon package.

- [ ] **Step 4: Make tool controls icon-first without removing accessible labels**

Set `data-tooltip={tool.label}` and keep `aria-label={tool.label}` on each tool link/button. Wrap the visible label in `<span className="launcher-sr-only">{tool.label}</span>`. Style the rail as a centered vertical glass strip, each item as a 2.9rem square, and use `::after` for hover/focus tooltips positioned left of the rail.

Increase top controls to 2.75rem circular glass buttons with consistent spacing, subtle borders, and project-accent hover/focus states. Keep all link safety and QR behavior unchanged.

- [ ] **Step 5: Run focused and full tests**

Run: `pnpm test -- src/launcher/components/ToolRail.test.tsx src/launcher/components/TopControls.test.tsx`

Expected: PASS.

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add src/launcher/components/LauncherIcon.tsx src/launcher/components/ToolRail.tsx src/launcher/components/ToolRail.test.tsx src/launcher/components/TopControls.tsx src/launcher/components/TopControls.test.tsx src/launcher/launcher.css
git commit -m "feat: refine launcher controls and tool rail"
```

---

### Task 5: Configuration documentation and visual release QA

**Files:**
- Modify: `README.md`
- Modify: `src/launcher/config.ts` only if a project needs an explicit `media.position`
- Modify: `src/launcher/launcher.css` only for issues reproduced during viewport QA
- Modify: the nearest launcher test before any behavioral bug fix found during QA

**Interfaces:**
- Consumes: all launcher interfaces and CSS classes produced by Tasks 1–4.
- Produces: user-editable configuration guidance and recorded desktop/mobile release evidence.

- [ ] **Step 1: Document the configuration surface**

Add a `Launcher configuration` README section linking to `src/launcher/config.ts`. List `name`, `code`, `description`, `url`, `actionLabel`, `accent`, `media`, `media.position`, `slides`, `feeds`, `href`, and `qrImage`; list `public/images`, `public/videos`, `public/info-swiper`, and `public/launcher/tools` as the static asset locations. State that ARK is HLS-only and unsupported browsers show its poster.

- [ ] **Step 2: Run automated release verification**

Run:

```powershell
pnpm test
pnpm build
git diff --check
```

Expected: all tests pass, `astro check` reports 0 errors, the production build completes, and `git diff --check` reports no whitespace errors.

- [ ] **Step 3: Start the local site for browser QA**

Run: `pnpm dev --host 127.0.0.1`

Use `http://localhost:4321/`. If that port is occupied by an older process, stop only the process whose command line resolves to this repository, then restart it.

- [ ] **Step 4: Verify desktop geometry and interactions**

At `1920x1080`, `1440x900`, and `1366x768`, verify and record:

- the launcher window stays 24–32px from the viewport and the page has `scrollWidth === innerWidth` and `scrollHeight === innerHeight`;
- background media bounds equal the stage bounds, `object-fit` is `cover`, and each media element has non-zero intrinsic dimensions;
- the information dock bounding rectangle is byte-for-byte unchanged after selecting 公告, 新闻, and 资讯;
- SCHNIE/PROJECTS, the four project controls, identity, dock, action, top controls, and right icon rail neither overlap nor leave the intended window;
- all four project switches update identity, accent, media, action, and dock without console errors;
- GitHub is a safe new-tab link; Monitor opens a QR dialog and closes by Escape/backdrop/button; details and fullscreen controls work;
- on an HLS-capable browser, ARK video is muted, not paused after readiness, and `currentTime` advances; on a browser without MSE/HLS, the poster is visible and the playback control is disabled;
- normal motion mode exposes non-`none` entrance/project/content animations; reduced-motion emulation disables them.

Capture full launcher screenshots at `1920x1080` and `1440x900` and compare them against the supplied references for proportion, alignment, contrast, and control density.

- [ ] **Step 5: Verify mobile rejection**

At `390x844` and `820x1180`, verify only the desktop-access notice is visible, `document.querySelector("video")` and `.swiper` are absent, and neither axis overflows.

- [ ] **Step 6: Fix only reproduced QA issues with TDD**

For every behavior defect, first add a failing test to the nearest existing `*.test.tsx`, run it to confirm the expected failure, apply the smallest production change, then rerun the focused test. Pure CSS geometry corrections must be tied to a recorded failing viewport measurement and re-measured after the change.

- [ ] **Step 7: Run final verification and commit**

Run:

```powershell
pnpm test
pnpm build
git diff --check
git status --short
```

Expected: all commands succeed; tracked changes are limited to the launcher, tests, README, design, and plan files; `.superpowers` remains untracked/ignored.

Commit:

```powershell
git add README.md src/launcher docs/superpowers/specs/2026-09-02-sch-nie-launcher-design.md docs/superpowers/plans/2026-09-03-sch-nie-launcher-commercial-polish.md
git commit -m "feat: deliver polished SCH-NIE launcher"
```
