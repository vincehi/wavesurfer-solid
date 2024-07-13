import { WavesurferPlayer, createWavesurfer } from "@/index-copy.jsx";
import { createEffect, createSignal } from "solid-js";
import type { JSX } from "solid-js";
import { render } from "solid-js/web";
import type WaveSurfer from "wavesurfer.js";

// import WavesurferPlayer from "../dist/index.js";

const audioUrls = ["/examples/audio.wav", "/examples/stereo.mp3"];

const randomColor = () =>
  `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;

const App = (): JSX.Element => {
  const [urlIndex, setUrlIndex] = createSignal(0);
  const [waveColor, setWaveColor] = createSignal(randomColor());
  const [wavesurfer, setWavesurfer] = createSignal<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = createSignal(false);

  // Swap the audio URL
  const onUrlChange = () => {
    setIsPlaying(false);
    setUrlIndex((index) => (index + 1) % audioUrls.length);
  };

  // Play/pause the audio
  const onPlayPause = () => {
    setIsPlaying((playing) => {
      if (wavesurfer()?.isPlaying() !== !playing) {
        wavesurfer()?.playPause();
        return !playing;
      }
      return playing;
    });
  };

  let containerRef;

  // const {
  //   wavesurfer: useWaveSurfer,
  //   isReady: useIsReady,
  //   isPlaying: useIsPlaying,
  //   currentTime: useCurrentTime,
  // } = createWavesurfer({
  //   get container() {
  //     return containerRef!;
  //   },
  //   get url() {
  //     return audioUrls[urlIndex()];
  //   },
  //   waveColor: "purple",
  //   height: 100,
  // });

  const {
    wavesurfer: useWaveSurfer,
    isReady: useIsReady,
    isPlaying: useIsPlaying,
    currentTime: useCurrentTime,
  } = createWavesurfer({
    getContainer: () => containerRef,
    get url() {
      return audioUrls[urlIndex()];
    },
    waveColor: "purple",
    height: 100,
  });

  // Randomize the wave color
  const onColorChange = () => {
    wavesurfer()?.setOptions({ waveColor: randomColor() });
    useWaveSurfer()?.setOptions({ waveColor: randomColor() });
    console.log(wavesurfer());
    console.log(useWaveSurfer());
    // useWaveSurfer()?.setOptions({ waveColor: randomColor() });
  };

  createEffect(() => {
    // console.log(useCurrentTime);
    // console.log(useIsPlaying);
    // console.log(useIsReady);
    console.log(useWaveSurfer());
  });

  return (
    <>
      <WavesurferPlayer
        height={100}
        waveColor={waveColor()}
        url={audioUrls[urlIndex()]}
        onReady={(ws) => {
          return setWavesurfer(ws);
        }}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <div style={{ margin: "1em 0", display: "flex", gap: "1em" }}>
        <button onClick={onUrlChange}>Change audio</button>

        <button onClick={onColorChange}>Randomize color</button>

        <button onClick={onPlayPause} style={{ "min-width": "5em" }}>
          {isPlaying() ? "Pause" : "Play"}
        </button>
      </div>

      <div ref={(el) => (containerRef = el)} />
    </>
  );
};

// Render the app
render(() => <App />, document.getElementById("app") as HTMLElement);
