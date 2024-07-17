import { render, renderHook } from "@solidjs/testing-library";
import { beforeAll, describe, expect, it, vi } from "vitest";
import WaveSurfer from "wavesurfer.js";
import WavesurferPlayer, {
  WavesurferEventHandler,
  createWavesurfer,
} from "../dist/index";

// Mock WaveSurfer.create
beforeAll(() => {
  vi.spyOn(WaveSurfer, "create").mockImplementation((...args) => {
    function MockWaveSurfer(options) {
      this.listeners = {};
      if (options.url) {
        this.load(options.url);
      }
    }
    MockWaveSurfer.prototype = WaveSurfer.prototype;

    MockWaveSurfer.prototype.load = async function () {
      await Promise.resolve();
      this.emit("ready");
    };

    MockWaveSurfer.prototype.destroy = function () {};

    return new MockWaveSurfer(...args);
  });
});

describe("wavesurfer-solidjs tests", () => {
  it("should render wavesurfer with basic options", () => {
    const props = { waveColor: "purple" };

    render(() => <WavesurferPlayer {...props} />);

    expect(WaveSurfer.create).toHaveBeenCalledWith({
      ...props,
      container: expect.any(HTMLDivElement),
    });
  });

  it("should render wavesurfer with events", (done) => {
    const props = { url: "test.mp3", waveColor: "purple" };

    const onReady: WavesurferEventHandler<[duration: number]> = (
      wavesurfer
    ) => {
      expect(wavesurfer).toBeInstanceOf(WaveSurfer);
      done;
    };

    render(() => <WavesurferPlayer {...props} onReady={onReady} />);

    expect(WaveSurfer.create).toHaveBeenCalledWith({
      ...props,
      container: expect.any(HTMLElement),
    });

    expect(WaveSurfer.create).toHaveBeenCalled();
  });
});

describe("createWavesurfer hook tests", () => {
  it("should create wavesurfer instance with basic options", () => {
    const { result } = renderHook(() =>
      createWavesurfer({
        getContainer: () => document.createElement("div"),
      })
    );

    expect(WaveSurfer.create).toHaveBeenCalledWith({
      container: expect.any(HTMLElement),
    });

    expect(result.wavesurfer()).toBeInstanceOf(WaveSurfer);
  });

  it("should handle wavesurfer state changes", async () => {
    const props = {
      getContainer: () => document.createElement("div"),
      url: "test.mp3",
      waveColor: "purple",
    };

    const { result } = renderHook(() => createWavesurfer(props));

    expect(result.isReady()).toBe(false);
    expect(result.isPlaying()).toBe(false);
    expect(result.currentTime()).toBe(0);

    // Simulate ready event
    result.wavesurfer().emit("ready");
    expect(result.isReady()).toBe(true);

    // Simulate play event
    result.wavesurfer().emit("play");
    expect(result.isPlaying()).toBe(true);

    // Simulate pause event
    result.wavesurfer().emit("pause");
    expect(result.isPlaying()).toBe(false);
  });
});
