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
      kind: "video",
      src: "/videos/ark.mp4",
      autoplay: true,
      muted: true,
    });
    expect(getProjectById("ark").audio).toEqual({
      src: "/audios/bgm.mp3",
      loop: true,
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
