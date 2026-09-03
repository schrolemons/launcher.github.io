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
  top?: number;
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
  audio?: { src: string; loop: boolean };
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
