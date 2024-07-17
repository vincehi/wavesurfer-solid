# wavesurfer-solidjs

[![npm](https://img.shields.io/npm/v/wavesurfer-solidjs)](https://www.npmjs.com/package/wavesurfer-solidjs)

A solidJS component and hook for [wavesurfer.js](http://github.com/katspaugh/wavesurfer.js).

It makes it easy to use wavesurfer from solidJS. All of the familiar [wavesurfer options](https://wavesurfer.xyz/docs/types/wavesurfer.WaveSurferOptions) become solidJS props.

You can subscribe to various [wavesurfer events](https://wavesurfer.xyz/docs/types/wavesurfer.WaveSurferEvents) also via props. Just prepend an event name with on, e.g. `ready` -> `onReady`. Each event callback receives a wavesurfer instance as the first argument.

## Installation

With yarn:

```bash
yarn add wavesurfer.js wavesurfer-solidjs
```

With npm:

```bash
npm install wavesurfer.js wavesurfer-solidjs
```

## Usage

As a component:

```js
import WavesurferPlayer from "wavesurfer-solidjs";

const App = () => {
  const [wavesurfer, setWavesurfer] = createSignal(null);
  const [isPlaying, setIsPlaying] = createSignal(false);

  const onReady = (ws) => {
    setWavesurfer(ws);
    setIsPlaying(false);
  };

  const onPlayPause = () => {
    wavesurfer()?.playPause();
  };

  return (
    <>
      <WavesurferPlayer
        height={100}
        waveColor="violet"
        url="/my-server/audio.wav"
        onReady={onReady}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      <button onClick={onPlayPause}>{isPlaying() ? "Pause" : "Play"}</button>
    </>
  );
};
```

Alternatively, as a hook:

```js
import { createWavesurfer } from "wavesurfer-solidjs";

const App = () => {
  let containerRef;

  const { wavesurfer, isReady, isPlaying, currentTime } = createWavesurfer({
    getContainer: () => containerRef,
    url: "/my-server/audio.ogg",
    waveColor: "purple",
    height: 100,
  });

  return <div ref={(el) => (containerRef = el)} />;
};
```

## Docs

https://wavesurfer.xyz
