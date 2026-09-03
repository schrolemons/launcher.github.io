import type { LauncherProject, LauncherTool, ProjectId } from "./types";

const emptyFeeds = () => ({
  announcement: [],
  news: [],
  information: [],
});

// 资讯/新闻条目与左侧轮播图统一占位外链。后续按条目替换为各自的实际外部链接即可，顺序即下方数组顺序。
const PLACEHOLDER_HREF = "https://blog.sch-nie.com/";

const arkFeeds = {
  announcement: [
    { title: "最新公告", date: "2026-03-23", href: PLACEHOLDER_HREF, tag: "公告" },
  ],
  news: [
    { title: "04逝时宏鳞", date: "2025-11-17", href: PLACEHOLDER_HREF, tag: "事件" },
    { title: "02旧神荒圃", date: "2025-11-17", href: PLACEHOLDER_HREF, tag: "事件" },
    { title: "05-1重返故都", date: "2025-11-17", href: PLACEHOLDER_HREF, tag: "事件" },
    { title: "01云末王冕", date: "2025-11-17", href: PLACEHOLDER_HREF, tag: "事件" },
    { title: "03初醒之刻", date: "2097-11-17", href: PLACEHOLDER_HREF, tag: "事件" },
    { title: "05-2星源绘逢", date: "2097-11-17", href: PLACEHOLDER_HREF, tag: "事件" },
  ],
  information: [
    { title: "草引囚徒", date: "2025-11-17", href: PLACEHOLDER_HREF, tag: "微故事" },
    { title: "风落和鸣", date: "2025-11-17", href: PLACEHOLDER_HREF, tag: "微故事" },
    { title: "雷云之梦", date: "2025-11-17", href: PLACEHOLDER_HREF, tag: "微故事" },
    { title: "土奏琴璃", date: "2025-11-17", href: PLACEHOLDER_HREF, tag: "微故事" },
    { title: "水渊蚀源", date: "2097-11-17", href: PLACEHOLDER_HREF, tag: "微故事" },
    { title: "01借以神名", date: "2097-11-17", href: PLACEHOLDER_HREF, tag: "世界观" },
    { title: "03虹九重构", date: "2097-11-17", href: PLACEHOLDER_HREF, tag: "世界观" },
    { title: "02终态行旅", date: "2097-11-17", href: PLACEHOLDER_HREF, tag: "世界观" },
  ],
} satisfies LauncherProject["feeds"];

export const launcherProjects = [
  {
    id: "ark",
    name: "SCHNIE:ARK",
    code: "ARK",
    description: "POWERED BY SCHROLEMONS",
    url: "https://ark.sch-nie.com/",
    actionLabel: "进入方舟",
    accent: "#f4ee00",
    accentSoft: "rgba(244, 238, 0, 0.22)",
    media: {
      kind: "hls",
      src: "/videos/PV04_landscape/PV04_landscape.m3u8",
      poster: "/images/index-bg.jpg",
      autoplay: true,
      muted: true,
    },
    audio: { src: "/audios/bgm.mp3", loop: true },
    slides: [
      { title: "用户文档", image: "/info-swiper/UserDocumentation.jpg", href: PLACEHOLDER_HREF },
      { title: "第九宇宙", image: "/info-swiper/Blog.jpg", href: PLACEHOLDER_HREF },
      { title: "角色诞生", image: "/info-swiper/DeveloperDocumentation.jpg", href: PLACEHOLDER_HREF },
    ],
    feeds: arkFeeds,
  },
  {
    id: "blog",
    name: "SCHNIE:BLOG",
    code: "BLOG",
    description: "第九边缘博客 · 一种新的生命态度",
    url: "https://blog.sch-nie.com/",
    actionLabel: "阅读博客",
    accent: "#22bff2",
    accentSoft: "rgba(34, 191, 242, 0.22)",
    media: { kind: "image", src: "/info-swiper/Blog.jpg" },
    slides: [],
    feeds: emptyFeeds(),
  },
  {
    id: "zero",
    name: "Zero",
    code: "ZERO",
    description: "内容由站点维护者补充",
    url: "https://zero.sch-nie.com/",
    actionLabel: "抵达零点",
    accent: "#ff8a3d",
    accentSoft: "rgba(255, 138, 61, 0.22)",
    media: { kind: "image", src: "/images/layout-bg.jpg" },
    slides: [],
    feeds: emptyFeeds(),
  },
  {
    id: "world",
    name: "第九边缘：SCHNIE/生涅",
    code: "WORLD",
    description: "仅属于虚拟自我的具象世界",
    url: "https://world.sch-nie.com/",
    actionLabel: "探索世界",
    accent: "#b9a0ff",
    accentSoft: "rgba(185, 160, 255, 0.22)",
    media: { kind: "image", src: "/info-swiper/UserDocumentation.jpg" },
    slides: [],
    feeds: emptyFeeds(),
  },
] satisfies LauncherProject[];

export const launcherTools: LauncherTool[] = [
  {
    id: "github",
    label: "GitHub",
    description: "SCHNIE 的开源仓库",
    icon: "github",
    mode: "link",
    href: "https://github.com/schrolemons/arknights.github.io",
  },
  {
    id: "monitor",
    label: "Monitor",
    description: "SCHNIE 站点监控面板",
    icon: "monitor",
    mode: "both",
    href: "https://monitor.sch-nie.com/",
    // Future WeChat asset example: qrImage: "/launcher/tools/wechat-qr.svg",
    qrImage: "/launcher/tools/monitor-qr.svg",
  },
];

export function getProjectById(id: ProjectId): LauncherProject {
  const project = launcherProjects.find((item) => item.id === id);

  if (!project) {
    throw new Error(`Unknown launcher project: ${id}`);
  }

  return project;
}
