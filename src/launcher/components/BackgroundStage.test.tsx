import { render, screen, fireEvent } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BackgroundStage from "./BackgroundStage";
import { getProjectById } from "../config";

beforeEach(() => vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {}));

describe("background playback", () => {
  const props = { project: getProjectById("ark"), paused: false, muted: true, visible: true, mediaMode: "video" as const };

  it("enables playback controls only after the browser can play the video", () => {
    const availability = vi.fn();
    render(<BackgroundStage {...props} onPlaybackAvailabilityChange={availability} />);
    expect(availability).toHaveBeenLastCalledWith(false);
    fireEvent.canPlay(screen.getByTestId("launcher-video"));
    expect(availability).toHaveBeenLastCalledWith(true);
  });

  it("falls back to the poster and disables playback on a video error", () => {
    const availability = vi.fn();
    render(<BackgroundStage {...props} onPlaybackAvailabilityChange={availability} />);
    fireEvent.error(screen.getByTestId("launcher-video"));
    expect(screen.queryByTestId("launcher-video")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "ARK 背景" })).toHaveAttribute("src", "/images/media/2-1.jpg");
    expect(availability).toHaveBeenLastCalledWith(false);
  });
});
