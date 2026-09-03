import { launcherProjects, launcherTools } from "./config";

const IMAGE_TIMEOUT = 15000;
const VIDEO_TIMEOUT = 30000;

function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image();
    const timeout = window.setTimeout(done, IMAGE_TIMEOUT);
    let settled = false;

    function done() {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      resolve();
    }

    image.onload = done;
    image.onerror = done;
    image.src = src;
  });
}

function preloadVideo(src: string): Promise<void> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const timeout = window.setTimeout(done, VIDEO_TIMEOUT);
    let settled = false;

    function done() {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      video.removeAttribute("src");
      video.load();
      resolve();
    }

    video.preload = "auto";
    video.muted = true;
    video.addEventListener("canplay", done, { once: true });
    video.addEventListener("error", done, { once: true });
    video.src = src;
  });
}

function collectAssets(): { images: string[]; videos: string[] } {
  const images = new Set<string>();
  const videos = new Set<string>();

  for (const project of launcherProjects) {
    const { media } = project;

    if (media.kind === "video") {
      videos.add(media.src);
    } else {
      images.add(media.src);
    }
    if (media.poster) images.add(media.poster);

    for (const slide of project.slides) {
      images.add(slide.image);
    }
  }

  for (const tool of launcherTools) {
    if ("qrImage" in tool && tool.qrImage) images.add(tool.qrImage);
  }

  return { images: [...images], videos: [...videos] };
}

export async function preloadLauncherAssets(): Promise<void> {
  const { images, videos } = collectAssets();

  await Promise.all([
    ...images.map(preloadImage),
    ...videos.map(preloadVideo),
  ]);
}
