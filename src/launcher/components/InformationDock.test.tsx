import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import InformationDock from "./InformationDock";
import { getProjectById } from "../config";

describe("feed pagination", () => {
  const project = { ...getProjectById("blog"), feeds: { announcement: Array.from({ length: 7 }, (_, i) => ({ title: `公告 ${i + 1}`, date: "2026-09-05" })), news: [], information: [] } };

  it("can reach every page with the keyboard without changing feed category", () => {
    render(<InformationDock project={project} />);
    const panel = screen.getByRole("tabpanel");
    fireEvent.keyDown(panel, { key: "PageDown" });
    expect(within(panel).getByText("公告 4")).toBeInTheDocument();
    expect(within(panel).queryByText("公告 1")).not.toBeInTheDocument();
    fireEvent.keyDown(panel, { key: "End" });
    expect(within(panel).getByText("公告 7")).toBeInTheDocument();
    fireEvent.keyDown(panel, { key: "Home" });
    expect(within(panel).getByText("公告 1")).toBeInTheDocument();
  });

  it("supports visible page buttons and resets the page on category changes", () => {
    render(<InformationDock project={project} />);
    expect(screen.getByRole("button", { name: "上一页资讯" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "下一页资讯" }));
    expect(screen.getByText("公告 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: "新闻" }));
    fireEvent.click(screen.getByRole("tab", { name: "公告" }));
    expect(screen.getByText("公告 1")).toBeInTheDocument();
  });
});
