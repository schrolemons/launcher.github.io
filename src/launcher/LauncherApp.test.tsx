import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LauncherApp from "./LauncherApp";

describe("LauncherApp", () => {
  it("renders the complete launcher brand and stable layout regions", () => {
    render(<LauncherApp />);

    expect(screen.getByText("SCHNIE")).toBeInTheDocument();
    expect(screen.getByText("PROJECTS")).toBeInTheDocument();
    expect(screen.getByTestId("launcher-hero")).toHaveAttribute("data-project-id", "ark");
    expect(screen.getByTestId("launcher-bottom")).toContainElement(screen.getByTestId("information-dock"));
  });

  it("starts on ARK and switches preview identity without navigating", async () => {
    const user = userEvent.setup();
    render(<LauncherApp />);

    expect(screen.getByRole("heading", { name: "SCHNIE:ARK" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /选择 BLOG/ }));
    expect(screen.getByRole("heading", { name: "SCHNIE:BLOG" })).toBeInTheDocument();
    expect(screen.getByText("第九边缘博客")).toBeInTheDocument();
  });

  it("exposes distinct project actions", async () => {
    const user = userEvent.setup();
    render(<LauncherApp />);
    const arkAction = screen.getByRole("link", { name: /进入方舟/ });
    expect(arkAction).toHaveAttribute("href", "https://ark.sch-nie.com/");
    expect(arkAction).toHaveAttribute("target", "_blank");
    expect(arkAction).toHaveAttribute("rel", "noopener noreferrer");
    await user.click(screen.getByRole("button", { name: /选择 WORLD/ }));
    expect(screen.getByRole("link", { name: /探索世界/ })).toHaveAttribute("href", "https://world.sch-nie.com/");
  });

  it("keeps the selected project exposed to assistive technology", () => {
    render(<LauncherApp />);

    expect(screen.getByRole("button", { name: /选择 ARK/ })).toHaveAttribute("aria-pressed", "true");
  });

  it("tabs through launcher controls without exposing a closed tool popover", async () => {
    const user = userEvent.setup();
    render(<LauncherApp />);

    const expectedFocusableElements = [
      screen.getByRole("button", { name: /选择 ARK/ }),
      screen.getByRole("button", { name: /选择 BLOG/ }),
      screen.getByRole("button", { name: /选择 ZERO/ }),
      screen.getByRole("button", { name: /选择 WORLD/ }),
      screen.getByRole("button", { name: "取消静音" }),
      screen.getByRole("button", { name: "暂停" }),
      screen.getByRole("button", { name: "全屏" }),
      screen.getByRole("link", { name: "用户文档" }),
      screen.getByRole("link", { name: "第九宇宙" }),
      screen.getByRole("link", { name: "角色诞生" }),
      screen.getByRole("button", { name: "Previous slide" }),
      screen.getByRole("button", { name: "Next slide" }),
      screen.getByRole("tab", { name: "公告" }),
      screen.getByRole("tabpanel"),
      screen.getByRole("link", { name: /最新公告/ }),
      screen.getByRole("link", { name: /进入方舟/ }),
      screen.getByRole("button", { name: /显示 SCHNIE:ARK 详情/ }),
      screen.getByRole("link", { name: "GitHub" }),
      screen.getByRole("button", { name: "Monitor" }),
    ];

    for (const element of expectedFocusableElements) {
      await user.tab();
      expect(element).toHaveFocus();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }
  });

  it("describes the mute action and updates it after activation", async () => {
    const user = userEvent.setup();
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    render(<LauncherApp />);

    expect(screen.getAllByTestId("launcher-audio")[0]).toHaveAttribute("src", "/audios/ark.mp3");
    const muteButton = screen.getByRole("button", { name: "取消静音" });
    expect(muteButton).toBeInTheDocument();
    await user.click(muteButton);
    expect(screen.getByRole("button", { name: "静音" })).toBeInTheDocument();
    expect(play).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /选择 ZERO/ }));
    expect(screen.getByRole("button", { name: "暂停" })).toBeDisabled();
  });

  it("switches to a static image and disables playback controls", async () => {
    const user = userEvent.setup();
    render(<LauncherApp />);

    await user.click(screen.getByRole("button", { name: "切换为图片背景" }));

    expect(screen.getByRole("button", { name: "切换为视频背景" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "暂停" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "取消静音" })).toBeDisabled();
  });

  it("omits the media toggle for a static image project", async () => {
    const user = userEvent.setup();
    render(<LauncherApp />);

    await user.click(screen.getByRole("button", { name: /选择 ZERO/ }));

    expect(screen.queryByRole("button", { name: "切换为视频背景" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "切换为图片背景" })).not.toBeInTheDocument();
  });

  it("opens the active project details without duplicating the information dock", async () => {
    const user = userEvent.setup();
    render(<LauncherApp />);

    await user.click(screen.getByRole("button", { name: /显示 SCHNIE:ARK 详情/ }));

    expect(screen.getByRole("region", { name: "SCHNIE:ARK 详情" })).toHaveTextContent("ark.sch-nie.com");
    expect(screen.getAllByRole("region", { name: /ARK/ }).length).toBeGreaterThan(0);
  });

  it("exposes the tool rail and closes its monitor card when the project changes", async () => {
    const user = userEvent.setup();
    render(<LauncherApp />);

    await user.click(screen.getByRole("button", { name: /Monitor/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /选择 BLOG/ }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
