import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import ToolRail from "./ToolRail";
import { launcherTools } from "../config";

function Harness() {
  const [openToolId, setOpenToolId] = useState<string | null>(null);
  return <ToolRail tools={launcherTools} openToolId={openToolId} onOpenTool={setOpenToolId} onCloseTool={() => setOpenToolId(null)} accent="#fff" accentSoft="transparent" />;
}

describe("QR dialog keyboard access", () => {
  it("moves focus into the dialog, traps Tab, and returns focus after Escape", () => {
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Monitor" });
    trigger.focus();
    fireEvent.click(trigger);
    const close = screen.getByRole("button", { name: "关闭 Monitor 二维码" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(screen.getByRole("link", { name: "直接访问" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
