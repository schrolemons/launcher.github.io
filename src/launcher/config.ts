import type { LauncherProject, LauncherTool, ProjectId } from "./types";

const emptyFeeds = () => ({
  announcement: [],
  news: [],
  information: [],
});

// 资讯/新闻条目与左侧轮播图统一占位外链。后续按条目替换为各自的实际外部链接即可，顺序即下方数组顺序。
const PLACEHOLDER_HREF = "https://ark.sch-nie.com/";

const arkFeeds = {
  announcement: [
    { title: "最新公告", date: "2026-03-23", href: PLACEHOLDER_HREF, tag: "公告" },
  ],
  news: [
    
  ],
  information: [
   
  ],
} satisfies LauncherProject["feeds"];

export const launcherProjects = [
  {
    id: "ark",
    name: "SCHNIE:ARK",
    code: "ARK",
    description: "第九边缘方舟 · 即刻浏览世界观",
    url: "https://ark.sch-nie.com/",
    actionLabel: "进入方舟",
    accent: "#f4ee00",
    accentSoft: "rgba(244, 238, 0, 0.22)",
    media: {
      kind: "video",
      src: "/videos/ark.mp4",
      poster: "/images/media/2-1.jpg",
      thumb: "/images/media/2-1-thumb.jpg",
      autoplay: true,
      muted: true,
    },
    audio: { src: "/audios/ark.mp3", loop: true },
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
    media: {
      kind: "video",
      src: "/videos/blog.mp4",
      poster: "/images/media/2-2.png",
      thumb: "/images/media/2-2-thumb.jpg",
      autoplay: true,
      muted: true,
    },
    audio: { src: "/audios/blog.mp3", loop: true },
    slides: [],
    feeds: emptyFeeds(),
  },
  {
    id: "world",
    name: "SCHNIE：WORLD",
    code: "WORLD",
    description: "第九边缘世界 · 仅属于虚拟自我的具象世界",
    url: "https://world.sch-nie.com/",
    actionLabel: "探索世界",
    accent: "#b9a0ff",
    accentSoft: "rgba(185, 160, 255, 0.22)",
    media: {
      kind: "video",
      src: "/videos/world.mp4",
      poster: "/images/media/2-3.png",
      thumb: "/images/media/2-3-thumb.jpg",
      autoplay: true,
      muted: true,
    },
    audio: { src: "/audios/world.mp3", loop: true },
    slides: [],
    feeds: emptyFeeds(),
  },
    {
    id: "zero",
    name: "SCHNIE：Zero",
    code: "ZERO",
    description: "第九边缘元点 · 陈述核心内容",
    url: "https://zero.sch-nie.com/",
    actionLabel: "抵达零点",
    accent: "#ff8a3d",
    accentSoft: "rgba(255, 138, 61, 0.22)",
    media: { kind: "image", src: "/images/media/zero.png", thumb: "/images/media/zero-thumb.jpg" },
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
  {
    id: "qq",
    label: "QQ",
    description: "加入 SCHNIE 官方 QQ 群",
    icon: "qq",
    mode: "both",
    href: "https://qm.qq.com/q/BviRiChyAE",
    qrImage: "/launcher/tools/qq-qr.svg",
  },
  {
    id: "bilibili",
    label: "bilibili",
    description: "SCHNIE 的 B 站主页",
    icon: "bilibili",
    mode: "both",
    href: "https://b23.tv/e1vviXs",
    qrImage: "/launcher/tools/bilibili-qr.svg",
  },
  {
    id: "wechat-official",
    label: "微信公众号",
    description: "关注 SCHNIE 微信公众号",
    icon: "wechat",
    mode: "qr",
    qrImage: "/launcher/tools/wechat.jpeg",
  },
];

export function getProjectById(id: ProjectId): LauncherProject {
  const project = launcherProjects.find((item) => item.id === id);

  if (!project) {
    throw new Error(`Unknown launcher project: ${id}`);
  }

  return project;
}
