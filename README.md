# SCHNIE Launcher · 项目启动器

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

一个基于 [Astro](https://docs.astro.build/) 与 [React](https://react.dev/) 构建的桌面端项目启动器，模仿了《明日方舟》系列游戏的 PC 端启动器（Launcher）样式。

本仓库改编自 [AstroArknights](https://github.com/Yue-plus/astro-arknights)，在其基础上替换为自有品牌、自有媒体资源与自有项目入口，仅保留其启动器式的视觉氛围与交互质感，不复制参考启动器的商标、账号系统或专属图标资产。

A desktop project launcher built with [Astro](https://docs.astro.build/) and [React](https://react.dev/), inspired by the PC launcher style of the *Arknights* game series. This repository is adapted from [AstroArknights](https://github.com/Yue-plus/astro-arknights), replacing its branding, media, and project entries with our own.

## 功能特性 - Features

- 单一配置模块驱动的项目入口，聚合 `SCHNIE:ARK`、`SCHNIE:BLOG`、`第九边缘：SCHNIE` 与 `SCHNIE：Zero` 四个项目
- 每个项目拥有独立的主按钮文案、强调色、背景媒体、资讯与二维码工具
- 全视口单屏布局，支持 `1920x1080`、`1440x900`、`1366x768` 等桌面分辨率，无页面滚动
- 本地 MP4 背景视频静音自动播放，加载失败时回退海报图；`prefers-reduced-motion` 下关闭非必要动效
- 图标型右侧工具轨道，支持安全外链与本地二维码弹层
- 键盘与可访问性支持：分类标签使用 ← / → 切换；资讯列表使用 ↑ / ↓、PageUp / PageDown、Home / End 翻页；二维码弹层支持焦点循环与 Escape 关闭

## 本地运行 - Local Development

```shell
git clone <this-repository>
cd launcher-ark
pnpm install
pnpm dev
```

打开 [http://localhost:4321](http://localhost:4321)。

生产构建与测试：

```shell
pnpm test
pnpm build
```

## 启动器配置 - Launcher configuration

启动器由类型化配置模块 [src/launcher/config.ts](src/launcher/config.ts) 维护：

- **项目条目（projects）**：修改 `name`、`code`、`description`、`url`、`actionLabel`、`accent`、`accentSoft`、`media`、`audio`、`slides` 与 `feeds` 来更新项目信息。`media.position` 接受任意 CSS `object-position` 值，用于调整背景媒体的视觉焦点。
- **工具条目（tools）**：修改 `href` 与 `qrImage` 来更新外部工具入口；`mode` 支持 `link`（直接外链）、`qr`（仅二维码）与 `both`（二维码 + 直接访问）。

静态资源按用途放置：

- 背景图片 → `public/images/media/`
- 背景视频 → `public/videos/`
- 轮播封面 → `public/info-swiper/`
- 本地二维码 → `public/launcher/tools/`（配置值为站点根路径，如 `/launcher/tools/monitor-qr.svg`）

每个项目的资讯直接写在 `config.ts` 的 `feeds` 字段中，`top` 字段控制同一分类内的降序优先级，每页最多显示 3 条，支持滚轮、键盘与页码两侧按钮翻页。三个动态项目均使用 `public/videos/` 下的 MP4，播放失败时回退海报图；背景音乐使用独立的、需用户主动开启的循环音频轨道。

### 布局与 ZERO 专属界面

- Logo 与标题形成顶部视觉组，间距随窗口高度调整；较矮窗口采用紧凑排版。
- 半透明磨砂底板随底部资讯与启动区域定位，保留清晰顶边，不向上穿过标题。
- ZERO 保留静态背景和无音乐设定，使用独立的大字标题、黑白橙配色与元点档案卡片；右上角只保留全屏按钮。文字组件在 `src/launcher/components/ZeroProject.tsx`，独立样式在 `src/launcher/zero-project.css`。

### 加载与播放策略

- 桌面端保留所有项目视频、音轨及图片的预加载，视频达到浏览器的可连续播放状态后计入就绪进度；切换项目时复用已挂载的视频元素。
- 单项资源等待最多 12 秒，避免图片或媒体请求挂起导致无法进入。等待超过 5 秒会显示直接进入按钮，提前进入后仍继续预热资源。
- 宽度小于 900px 时不运行桌面媒体预加载，项目卡片使用现有缩略图。
- 浏览器标签页隐藏时暂停背景视频与音轨，返回时按原暂停设置恢复。系统设置减少动态效果时使用静态背景。
- 在 900–1180px 窗口下，主按钮移至资讯区下方，避免卡片和按钮挤压；更宽窗口保持并列布局。

## 项目结构 - Project structure

整个启动器是一个挂载在 Astro 页面上的客户端 React 应用，内容全部由配置驱动，改造成自己的项目通常只需编辑配置和替换静态资源，无需改动组件逻辑。

```text
src/
├── pages/
│   └── index.astro                    # 站点入口：桌面端挂载启动器，小屏显示降级入口
├── layouts/
│   └── LauncherLayout.astro           # HTML 骨架、favicon、字体与滚动条
├── _styles/
│   ├── FontFace.astro                 # 字体声明
│   └── Scrollbar.astro                # 全局滚动条样式
└── launcher/
    ├── config.ts                      # ★ 唯一需要改的内容配置：项目 / 工具 / 资讯
    ├── types.ts                       # 配置的类型定义
    ├── LauncherApp.tsx                # 状态持有者：当前项目、媒体、声音、工具弹层
    ├── DesktopLauncher.tsx            # 桌面断点判断、资源预加载与加载兜底入口
    ├── useAssetPreloader.ts           # 首屏资源预加载
    ├── launcher.css                   # 全部启动器样式
    └── components/
        ├── BackgroundStage.tsx        # 背景图片 / MP4 视频渲染与降级
        ├── ProjectRail.tsx            # 左侧项目轨道
        ├── ProjectIdentity.tsx        # 项目名称、代号与简介
        ├── InformationDock.tsx        # 轮播封面 + 公告 / 新闻 / 资讯
        ├── ProjectAction.tsx          # 右下角项目主按钮
        ├── ToolRail.tsx               # 右侧工具轨道与二维码弹层
        ├── TopControls.tsx            # 声音 / 播放 / 全屏控制
        └── LauncherIcon.tsx           # 内联 SVG 图标
```

### 关键入口说明

- [config.ts](src/launcher/config.ts) 是内容真相的唯一来源，导出 `launcherProjects`（项目列表）与 `launcherTools`（工具列表），其余组件只负责按配置渲染。
- [LauncherApp.tsx](src/launcher/LauncherApp.tsx) 持有全部运行时状态，通过 `getProjectById` 读取当前项目，并把媒体、音频、资讯、工具的控制权下发给子组件。
- [DesktopLauncher.tsx](src/launcher/DesktopLauncher.tsx) 负责 `min-width: 900px` 的桌面判断、资源预加载，以及加载超时后的兜底入口。
- [index.astro](src/pages/index.astro) 同时渲染移动端降级页与桌面启动器容器，二者互斥显示。

## 改造为你自己的博客 - Make it yours

把该项目改造成自己的博客或项目导航，按以下顺序操作即可：

1. **改配置**：编辑 [config.ts](src/launcher/config.ts)，替换 `launcherProjects` 中的 `name`、`code`、`description`、`url`、`actionLabel`、`accent`、`accentSoft`、`media`、`audio`、`slides` 与 `feeds`，并将 `launcherTools` 换成自己的外链与二维码。
2. **换资源**：把品牌 logo、背景图片 / 视频、轮播封面和二维码分别放入 `public/images/`、`public/videos/`、`public/info-swiper/`、`public/launcher/tools/`，保持与配置中的路径一致。
3. **改品牌文案**：在 [index.astro](src/pages/index.astro) 和 [DesktopLauncher.tsx](src/launcher/DesktopLauncher.tsx) 中替换 `SCHNIE`、副标题与加载文案；在 [LauncherLayout.astro](src/layouts/LauncherLayout.astro) 中替换 `title`、`description` 与 favicon。
4. **跑起来**：`pnpm install && pnpm dev`，用桌面视口（宽度 ≥ 900px）预览，按需微调 `launcher.css` 中的强调色与间距。

改造中只需保证 `config.ts` 导出的数据结构满足 [types.ts](src/launcher/types.ts) 中的类型即可，组件无需修改。若只想做一个单项目博客，可以只保留一个项目条目，其余项目会自动从左侧轨道隐藏。

## 许可证 - License

代码部分使用 [MIT License](./LICENSE)，版权归原作者 [Yue_plus](https://github.com/Yue-plus) 所有；基于本项目的修改与二次分发需保留上述版权与许可声明。

The code is licensed under the [MIT License](./LICENSE), copyright (c) 2024 Yue_plus. Modifications and redistributions must retain the above copyright and permission notice.
