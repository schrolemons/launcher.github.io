import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProjectById } from "../config";
import BackgroundStage from "./BackgroundStage";

const hlsLoadSource = vi.fn();
const hlsAttachMedia = vi.fn();
const hlsDestroy = vi.fn();
const hlsOn = vi.fn();
const hlsOff = vi.fn();
const hlsIsSupported = vi.fn(() => true);

vi.mock("hls.js", () => ({
  default: class Hls {
    static Events = { ERROR: "hlsError", MANIFEST_PARSED: "manifestParsed" };
    static isSupported = () => hlsIsSupported();
    loadSource = hlsLoadSource;
    attachMedia = hlsAttachMedia;
    destroy = hlsDestroy;
    on = hlsOn;
    off = hlsOff;
  },
}));

const arkProject = getProjectById("ark");
const blogProject = getProjectById("blog");

describe("BackgroundStage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    hlsIsSupported.mockReturnValue(true);
  });

  it("attaches ARK HLS, plays muted, and destroys the instance on project change", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    const { rerender } = render(
      <BackgroundStage project={arkProject} paused={false} muted onPlaybackAvailabilityChange={vi.fn()} />,
    );

    expect(hlsLoadSource).toHaveBeenCalledWith("/videos/PV04_landscape/PV04_landscape.m3u8");
    expect(hlsAttachMedia).toHaveBeenCalled();
    expect(screen.getByTestId<HTMLVideoElement>("launcher-video").muted).toBe(true);
    expect(screen.getByTestId("launcher-video")).toHaveAttribute("muted");
    const manifestHandler = hlsOn.mock.calls.find(([event]) => event === "manifestParsed")?.[1];
    act(() => manifestHandler?.());
    expect(play).toHaveBeenCalled();

    rerender(
      <BackgroundStage project={blogProject} paused={false} muted onPlaybackAvailabilityChange={vi.fn()} />,
    );

    expect(hlsOff).toHaveBeenCalledWith("manifestParsed", expect.any(Function));
    expect(hlsDestroy).toHaveBeenCalled();
  });

  it("uses the poster without constructing HLS when playback is unsupported", () => {
    hlsIsSupported.mockReturnValue(false);
    const availability = vi.fn();

    render(<BackgroundStage project={arkProject} paused={false} muted onPlaybackAvailabilityChange={availability} />);

    expect(screen.queryByTestId("launcher-video")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: /ARK 背景/ })).toHaveAttribute("src", "/images/index-bg.jpg");
    expect(hlsLoadSource).not.toHaveBeenCalled();
    expect(availability).toHaveBeenLastCalledWith(false);
  });

  it("waits for the HLS manifest before starting muted playback", () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, "play");
    render(<BackgroundStage project={arkProject} paused={false} muted onPlaybackAvailabilityChange={vi.fn()} />);

    play.mockClear();
    const manifestHandler = hlsOn.mock.calls.find(([event]) => event === "manifestParsed")?.[1];
    expect(play).not.toHaveBeenCalled();
    act(() => manifestHandler?.());

    expect(screen.getByTestId<HTMLVideoElement>("launcher-video").muted).toBe(true);
    expect(play).toHaveBeenCalledTimes(1);
  });

  it("shows the gradient after a static image fails", () => {
    render(<BackgroundStage project={blogProject} paused={false} muted onPlaybackAvailabilityChange={vi.fn()} />);

    fireEvent.error(screen.getByRole("img", { name: /BLOG 背景/ }));

    expect(screen.getByLabelText("BLOG 背景")).toHaveTextContent("BLOG");
  });

  it("sets the native video source for an ordinary video project", () => {
    const videoProject = {
      ...arkProject,
      media: {
        kind: "video" as const,
        src: "/videos/ordinary.mp4",
        poster: "/images/ordinary.jpg",
        autoplay: true,
        muted: true,
      },
    };

    render(<BackgroundStage project={videoProject} paused={false} muted onPlaybackAvailabilityChange={vi.fn()} />);

    expect(screen.getByTestId("launcher-video")).toHaveAttribute("src", "/videos/ordinary.mp4");
  });

  it("pauses an outgoing ordinary video when the project changes", () => {
    const videoProject = {
      ...arkProject,
      media: {
        kind: "video" as const,
        src: "/videos/ordinary.mp4",
        poster: "/images/ordinary.jpg",
        autoplay: true,
        muted: true,
      },
    };
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause");
    const { rerender } = render(
      <BackgroundStage project={videoProject} paused={false} muted onPlaybackAvailabilityChange={vi.fn()} />,
    );
    pause.mockClear();

    rerender(<BackgroundStage project={blogProject} paused={false} muted onPlaybackAvailabilityChange={vi.fn()} />);

    expect(pause).toHaveBeenCalledTimes(1);
  });
});
