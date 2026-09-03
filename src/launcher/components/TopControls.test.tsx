import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import TopControls from "./TopControls";

describe("TopControls", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses SVG icons while preserving accessible control names", () => {
    render(
      <TopControls
        muted
        onToggleMuted={vi.fn()}
        onTogglePaused={vi.fn()}
        paused={false}
        playable
        projectUrl="https://ark.sch-nie.com/"
      />,
    );

    for (const name of ["取消静音", "暂停", "全屏"]) {
      expect(screen.getByRole("button", { name }).querySelector('svg[aria-hidden="true"]')).not.toBeNull();
    }
  });

  it("announces a fullscreen rejection without moving focus", async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLElement.prototype, "requestFullscreen").mockRejectedValueOnce(new Error("blocked"));
    render(
      <TopControls
        muted
        onToggleMuted={vi.fn()}
        onTogglePaused={vi.fn()}
        paused={false}
        playable
        projectUrl="https://ark.sch-nie.com/"
      />,
    );

    const fullscreenButton = screen.getByRole("button", { name: "全屏" });
    await user.click(fullscreenButton);

    expect(fullscreenButton).toHaveFocus();
    expect(screen.getByText("浏览器未允许全屏显示")).toHaveAttribute("aria-live", "polite");
  });
});
