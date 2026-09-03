# Astro Arknights

[![CI](https://github.com/Yue-plus/astro-arknights/actions/workflows/deploy.yml/badge.svg)](https://github.com/Yue-plus/astro-arknights/actions/workflows/deploy.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Yue-plus/astro-arknights/blob/main/LICENSE)

The goal of [AstroArknights] is to build a fully-featured [Static Site Generator (SSG)](https://en.wikipedia.org/wiki/Static_site_generator) based on the [Astro](https://docs.astro.build/en/getting-started/) framework.
Its design pays homage to the official Simplified Chinese website of the mobile game [Arknights](HTTPS://ARK.SCH-NIE.COM/).

[AstroArknights] 的目标是基于 [Astro](https://docs.astro.build/zh-cn/getting-started/) 框架构建 *全特性* [静态网站生成器（<abbr title="Static Site Generator">SSG</abbr>）](https://en.wikipedia.org/wiki/Static_site_generator)。
其设计致敬了 [明日方舟](HTTPS://ARK.SCH-NIE.COM/) 手游简中官方网站。

The project is under development... / 项目开发中……

[Live Demo / 在线演示](https://arknights.astro.yue.zone/)

## Documentation - 文档

[简体中文](https://arknights.astro.yue.zone/docs/)

## Try Online - 在线尝试

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/Yue-plus/astro-arknights)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/Yue-plus/astro-arknights)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/Yue-plus/astro-arknights)

## Try Localhost - 本地运行

```shell
git clone https://github.com/Yue-plus/astro-arknights.git --depth=1
cd astro-arknights
pnpm install
pnpm dev
```

<http://localhost:4321>

## Launcher configuration

The desktop launcher is maintained from [the typed configuration module](src/launcher/config.ts). Edit project entries there to update `name`, `code`, `description`, `url`, `actionLabel`, `accent`, `media`, `audio`, `slides`, and non-ARK `feeds`; edit tool entries to update `href` and `qrImage`. `media.position` accepts any CSS `object-position` value.

Place background images and media under `public/images/`, `public/info-swiper/`, or `public/videos/` as appropriate. Place local QR images under `public/launcher/tools/`; the configured value is the corresponding site-root path (for example, `/launcher/tools/monitor-qr.svg`).

ARK feeds are generated from Markdown in `src/content/blog`. Use a numeric `top` frontmatter field to control descending priority inside each category; equal or omitted values keep collection order. The launcher shows three articles per page and changes pages with the mouse wheel. ARK video is HLS-only and deliberately falls back to its poster when HLS is unavailable; its BGM remains a separate user-activated looping audio track.

## License - 许可证

The code part uses [MIT License];
代码部分使用 [MIT License]；

All content in the [Content Collections (`src/content`)](https://github.com/Yue-plus/astro-arknights/tree/main/src/content) uses
<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/?ref=chooser-v1" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">
    CC BY-NC-SA 4.0
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt="">
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt="">
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1" alt="">
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1" alt="">
</a>；

[内容集合（`src/content`）](https://github.com/Yue-plus/astro-arknights/tree/main/src/content) 内的所有内容使用
<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans" target="_blank" rel="license noopener noreferrer" style="display:inline-block;">
    CC BY-NC-SA 4.0
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1" alt="">
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1" alt="">
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1" alt="">
    <img style="height:22px!important;margin-left:3px;vertical-align:text-bottom;" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1" alt="">
</a>；



[AstroArknights]: https://github.com/Yue-plus/astro-arknights
[MIT License]: https://github.com/Yue-plus/astro-arknights/blob/main/LICENSE
