import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { launcherProjects } from "../config";
import type { LauncherProject } from "../types";
import InformationDock from "./InformationDock";

vi.mock("swiper/react", () => ({
  Swiper: ({ children, navigation }: { children: React.ReactNode; navigation?: boolean }) => (
    <div>
      {navigation && <button aria-label="下一张" type="button">下一张</button>}
      {children}
      {navigation && <button aria-label="上一张" type="button">上一张</button>}
    </div>
  ),
  SwiperSlide: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const arkProject = launcherProjects[0];
const worldProject = launcherProjects[3];
const externalFeedProject: LauncherProject = {
  ...arkProject,
  feeds: {
    ...arkProject.feeds,
    announcement: [{ title: "外部资讯", date: "2026-09-03", href: "https://example.com/news", tag: "资讯" }],
  },
};
const rankedFeedProject: LauncherProject = {
  ...arkProject,
  feeds: {
    ...arkProject.feeds,
    announcement: [
      { title: "普通内容", date: "2026-09-01", top: 0 },
      { title: "置顶内容", date: "2026-08-01", top: 100 },
      { title: "次置顶内容", date: "2026-09-03", top: 20 },
    ],
  },
};

describe("InformationDock", () => {
  it("exposes carousel controls for populated project previews", () => {
    render(<InformationDock project={arkProject} />);

    expect(screen.getByRole("button", { name: "下一张" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "上一张" })).toBeInTheDocument();
  });

  it("shows the ARK announcement when the dock first opens", () => {
    render(<InformationDock project={arkProject} />);

    expect(screen.getByRole("tabpanel")).toHaveTextContent("最新公告");
  });

  it("orders each feed by the Markdown top value", () => {
    render(<InformationDock project={rankedFeedProject} />);

    const titles = screen.getAllByRole("article").map((row) => row.textContent);
    expect(titles[0]).toContain("置顶内容");
    expect(titles[1]).toContain("次置顶内容");
    expect(titles[2]).toContain("普通内容");
  });

  it("moves between feed tabs with arrow keys", async () => {
    const user = userEvent.setup();
    render(<InformationDock project={arkProject} />);
    const announcement = screen.getByRole("tab", { name: "公告" });

    announcement.focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("tab", { name: "新闻" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "新闻" })).toHaveAttribute("aria-selected", "true");
  });

  it("resets the feed tab to 公告 when the project changes", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<InformationDock project={arkProject} />);

    await user.click(screen.getByRole("tab", { name: "新闻" }));
    rerender(<InformationDock project={worldProject} />);

    expect(screen.getByRole("tab", { name: "公告" })).toHaveAttribute("aria-selected", "true");
  });

  it("keeps the empty WORLD feed dock height while showing the maintainer message", () => {
    const { rerender } = render(<InformationDock project={arkProject} />);
    const dock = screen.getByTestId("information-dock");
    const heightBefore = getComputedStyle(dock).minHeight;

    rerender(<InformationDock project={worldProject} />);

    expect(screen.getByRole("tabpanel")).toHaveTextContent("内容由站点维护者补充");
    expect(getComputedStyle(dock).minHeight).toBe(heightBefore);
  });

  it("keeps same-origin feed links in the current tab", () => {
    const sameOriginProject: LauncherProject = {
      ...arkProject,
      feeds: {
        ...arkProject.feeds,
        announcement: [{ title: "最新公告", date: "2026-03-23", href: "/blog/2026-3-23_公告", tag: "公告" }],
      },
    };
    render(<InformationDock project={sameOriginProject} />);

    const link = screen.getByRole("link", { name: /最新公告/ });
    expect(link).toHaveAttribute("href", "/blog/2026-3-23_公告");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("opens external feed links in a safe new tab", () => {
    render(<InformationDock project={externalFeedProject} />);

    const link = screen.getByRole("link", { name: /外部资讯/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
