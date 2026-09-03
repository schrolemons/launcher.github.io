import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { LauncherTool } from "../types";
import ToolRail from "./ToolRail";

const githubTool: LauncherTool = {
  id: "github",
  label: "GitHub",
  description: "SCHNIE 的开源仓库",
  icon: "github",
  mode: "link",
  href: "https://github.com/schrolemons/arknights.github.io",
};

const monitorTool: LauncherTool = {
  id: "monitor",
  label: "Monitor",
  description: "SCHNIE 站点监控面板",
  icon: "monitor",
  mode: "both",
  href: "https://monitor.sch-nie.com/",
  qrImage: "/launcher/tools/monitor-qr.svg",
};

const qrOnlyTool: LauncherTool = {
  id: "wechat",
  label: "WeChat",
  description: "SCHNIE 微信公众号",
  icon: "wechat",
  mode: "qr",
  qrImage: "/launcher/tools/wechat-qr.svg",
};

function ControlledToolRail({ tools }: { tools: LauncherTool[] }) {
  const [openToolId, setOpenToolId] = useState<string | null>(null);

  return (
    <ToolRail
      tools={tools}
      openToolId={openToolId}
      onOpenTool={setOpenToolId}
      onCloseTool={() => setOpenToolId(null)}
    />
  );
}

describe("ToolRail", () => {
  it("renders direct links without opening a popover", () => {
    render(<ControlledToolRail tools={[githubTool]} />);

    const link = screen.getByRole("link", { name: /GitHub/ });
    expect(link).toHaveAttribute("href", githubTool.href);
    expect(link).toHaveAttribute("data-tooltip", "GitHub");
    expect(link.querySelector("svg")).not.toBeNull();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders QR tools as labelled SVG icon controls", () => {
    render(<ControlledToolRail tools={[monitorTool]} />);

    const control = screen.getByRole("button", { name: "Monitor" });
    expect(control).toHaveAttribute("data-tooltip", "Monitor");
    expect(control.querySelector("svg")).not.toBeNull();
  });

  it("opens a combined QR card and keeps a direct visit action", async () => {
    const user = userEvent.setup();
    render(<ControlledToolRail tools={[monitorTool]} />);

    await user.click(screen.getByRole("button", { name: /Monitor/ }));
    expect(screen.getByRole("img", { name: "Monitor 二维码" })).toHaveAttribute("src", monitorTool.qrImage);
    expect(screen.getByRole("link", { name: "直接访问" })).toHaveAttribute("href", monitorTool.href);

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps the outbound action when the QR image fails", async () => {
    const user = userEvent.setup();
    render(<ControlledToolRail tools={[monitorTool]} />);

    await user.click(screen.getByRole("button", { name: /Monitor/ }));
    fireEvent.error(screen.getByRole("img", { name: "Monitor 二维码" }));

    expect(screen.getByText("二维码图片不可用")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "直接访问" })).toHaveAttribute("href", monitorTool.href);
  });

  it("shows a QR-only card without a direct visit action", async () => {
    const user = userEvent.setup();
    render(<ControlledToolRail tools={[qrOnlyTool]} />);

    await user.click(screen.getByRole("button", { name: /WeChat/ }));

    expect(screen.getByRole("img", { name: "WeChat 二维码" })).toHaveAttribute("src", qrOnlyTool.qrImage);
    expect(screen.queryByRole("link", { name: "直接访问" })).not.toBeInTheDocument();
  });

  it("closes the current card when the backdrop or close button is selected", async () => {
    const user = userEvent.setup();
    render(<ControlledToolRail tools={[monitorTool]} />);

    await user.click(screen.getByRole("button", { name: /Monitor/ }));
    await user.click(screen.getByRole("button", { name: /关闭 Monitor 二维码/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Monitor/ }));
    await user.click(screen.getByRole("dialog").parentElement as HTMLElement);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
