/// <reference path="../.astro/types.d.ts" />
declare module "swiper/css";
declare module "swiper/css/scrollbar";
declare module "swiper/css/autoplay";
declare module "swiper/css/navigation";
declare module "swiper/css/pagination";

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

interface ImportMetaEnv {
  readonly BASE_URL: string;
  // 更多环境变量...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}