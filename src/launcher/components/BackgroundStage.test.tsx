import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { getProjectById } from "../config";
import BackgroundStage from "./BackgroundStage";

const arkProject = getProjectById("ark");
const blogProject = getProjectById("blog");

describe("BackgroundStage", () => {
  it("plays the ARK MP4 muted once its metadata is ready", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    render(<BackgroundStage project={arkProject} paused={false} muted visible onPlaybackAvailabilityChange={vi.fn()} />);

    const video = screen.getByTestId<HTMLVideoElement>("launcher-video");
    expect(video).toHaveAttribute("src", "/videos/ark.mp4");
    expect(video.muted).toBe(true);
    expect(video).toHaveAttribute("muted");
    expect(play).not.toHaveBeenCalled();

    fireEvent.loadedMetadata(video);
    expect(play).toHaveBeenCalled();
  });

  it("pauses the video when paused becomes true", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
    const { rerender } = render(
      <BackgroundStage project={arkProject} paused={false} muted visible onPlaybackAvailabilityChange={vi.fn()} />,
    );

    fireEvent.loadedMetadata(screen.getByTestId("launcher-video"));
    expect(play).toHaveBeenCalled();

    rerender(<BackgroundStage project={arkProject} paused muted visible onPlaybackAvailabilityChange={vi.fn()} />);
    expect(pause).toHaveBeenCalled();
  });

  it("pauses the video when visible becomes false", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
    const { rerender } = render(
      <BackgroundStage project={arkProject} paused={false} muted visible onPlaybackAvailabilityChange={vi.fn()} />,
    );

    fireEvent.loadedMetadata(screen.getByTestId("launcher-video"));
    expect(play).toHaveBeenCalled();

    rerender(<BackgroundStage project={arkProject} paused={false} muted visible={false} onPlaybackAvailabilityChange={vi.fn()} />);
    expect(pause).toHaveBeenCalled();
  });

  it("reports playable media for a visible video and not for a static image", () => {
    const availability = vi.fn();
    const { rerender } = render(
      <BackgroundStage project={arkProject} paused={false} muted visible onPlaybackAvailabilityChange={availability} />,
    );
    expect(availability).toHaveBeenLastCalledWith(true);

    rerender(<BackgroundStage project={blogProject} paused={false} muted visible onPlaybackAvailabilityChange={availability} />);
    expect(availability).toHaveBeenLastCalledWith(false);
  });

  it("does not report playable when video is hidden", () => {
    const availability = vi.fn();
    render(
      <BackgroundStage project={arkProject} paused={false} muted visible={false} onPlaybackAvailabilityChange={availability} />,
    );
    expect(availability).toHaveBeenLastCalledWith(false);
  });

  it("shows the gradient after a static image fails", () => {
    render(<BackgroundStage project={blogProject} paused={false} muted visible onPlaybackAvailabilityChange={vi.fn()} />);

    fireEvent.error(screen.getByRole("img", { name: /BLOG 背景/ }));

    expect(screen.getByLabelText("BLOG 背景")).toHaveTextContent("BLOG");
  });
});