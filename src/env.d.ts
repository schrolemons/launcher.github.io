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
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
