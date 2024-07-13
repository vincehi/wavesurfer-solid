import { render } from "@solidjs/testing-library";
import { beforeAll, describe, expect, it, vi } from "vitest";
import WaveSurfer from "wavesurfer.js";
import WavesurferPlayer from "../dist/index";

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
      container: expect.any(HTMLElement),
    });
  });

  it("should render wavesurfer with events", (done) => {
    const props = { url: "test.mp3", waveColor: "purple" };

    const onReady = (wavesurfer) => {
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
