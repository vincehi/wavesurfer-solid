/**
 * A SolidJS component for wavesurfer.js
 *
 * Usage:
 *
 * import WavesurferPlayer from 'wavesurfer-solidjs'
 *
 * <WavesurferPlayer
 *   url="/my-server/audio.ogg"
 *   waveColor="purple"
 *   height={100}
 *   onReady={(wavesurfer) => console.log('Ready!', wavesurfer)}
 * />
 */
import {
  Accessor,
  Component,
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
  splitProps,
} from "solid-js";
import { reactify } from "solidjs-use";
import WaveSurfer, {
  type WaveSurferEvents,
  type WaveSurferOptions,
} from "wavesurfer.js";

type WavesurferEventHandler<T extends unknown[]> = (
  wavesurfer: WaveSurfer,
  ...args: T
) => void;

type OnWavesurferEvents = {
  [K in keyof WaveSurferEvents as `on${Capitalize<K>}`]?: WavesurferEventHandler<
    WaveSurferEvents[K]
  >;
};

type PartialWavesurferOptions = Omit<WaveSurferOptions, "container">;

/**
 * Props for the Wavesurfer component
 * @public
 */
export type WavesurferProps = PartialWavesurferOptions & OnWavesurferEvents;

/**
 * Use wavesurfer instance
 */
const createWavesurferInstance = (
  container: HTMLDivElement,
  options: Partial<WaveSurferOptions>
): Accessor<WaveSurfer | null> => {
  const [wavesurfer, setWavesurfer] = createSignal<WaveSurfer | null>(null);

  createEffect(() => {
    if (!container) return;

    console.log("create");
    const ws = WaveSurfer.create({
      ...options,
      container,
    });

    setWavesurfer(ws);

    onCleanup(() => {
      ws.destroy();
    });
  });

  return wavesurfer;
};

/**
 * Use wavesurfer state
 */
const createWavesurferState = (
  wavesurfer: () => WaveSurfer | null
): {
  isReady: Accessor<boolean>;
  isPlaying: Accessor<boolean>;
  currentTime: Accessor<number>;
} => {
  const [isReady, setIsReady] = createSignal(false);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);

  createEffect(() => {
    const ws = wavesurfer();
    if (!ws) return;

    const unsubscribeFns = [
      ws.on("load", () => {
        setIsReady(false);
        setIsPlaying(false);
        setCurrentTime(0);
      }),
      ws.on("ready", () => {
        setIsReady(true);
        setIsPlaying(false);
        setCurrentTime(0);
      }),
      ws.on("play", () => setIsPlaying(true)),
      ws.on("pause", () => setIsPlaying(false)),
      ws.on("timeupdate", () => setCurrentTime(ws.getCurrentTime())),
      ws.on("destroy", () => {
        setIsReady(false);
        setIsPlaying(false);
      }),
    ];

    onCleanup(() => {
      unsubscribeFns.forEach((fn) => fn());
    });
  });

  return { isReady, isPlaying, currentTime };
};

const EVENT_PROP_RE = /^on([A-Z])/;
const isEventProp = (key: string) => EVENT_PROP_RE.test(key);
const getEventName = (key: string) =>
  key.replace(EVENT_PROP_RE, (_, $1) =>
    $1.toLowerCase()
  ) as keyof WaveSurferEvents;

/**
 * Parse props into wavesurfer options and events
 */
const createWavesurferProps = (
  props: WavesurferProps
): [PartialWavesurferOptions, OnWavesurferEvents] => {
  // Props starting with `on` are wavesurfer events, e.g. `onReady`
  // The rest of the props are wavesurfer options
  const [local, others] = splitProps(
    props,
    Object.keys(props).filter(isEventProp) as (keyof WavesurferProps)[]
  );
  const options = mergeProps(others);
  const events = mergeProps(local);

  return [options, events];
};

/**
 * Subscribe to wavesurfer events
 */
const createWavesurferEvents = (
  wavesurfer: () => WaveSurfer | null,
  events: () => OnWavesurferEvents
) => {
  createEffect(() => {
    const ws = wavesurfer();
    if (!ws) return;

    const currentEvents = events();
    const eventEntries = Object.entries(currentEvents);
    if (!eventEntries.length) return;

    const unsubscribeFns = eventEntries.map(([name, handler]) => {
      const event = getEventName(name);
      return ws.on(event, (...args) =>
        (handler as WavesurferEventHandler<WaveSurferEvents[typeof event]>)(
          ws,
          ...args
        )
      );
    });

    onCleanup(() => {
      unsubscribeFns.forEach((fn) => fn());
    });
  });
};

/**
 * Wavesurfer player component
 * @see https://wavesurfer.xyz/docs/modules/wavesurfer
 * @public
 */
const WavesurferPlayer: Component<WavesurferProps> = (props) => {
  let containerRef: HTMLDivElement;

  const [options, events] = createWavesurferProps(props);
  const wavesurfer = createWavesurferInstance(containerRef, options);
  createWavesurferEvents(wavesurfer, () => events);

  return <div ref={(el) => (containerRef = el)} />;
};

/**
 * @public
 */
export default WavesurferPlayer;

/**
 * SolidJS hook for wavesurfer.js
 *
 * ```
 * import { createWavesurfer } from 'wavesurfer-solidjs'
 *
 * const App = () => {
 *   let containerRef
 *
 *   const { wavesurfer, isReady, isPlaying, currentTime } = createWavesurfer({
 *     container: containerRef,
 *     url: '/my-server/audio.ogg',
 *     waveColor: 'purple',
 *     height: 100,
 *   })
 *
 *   return <div ref={el => containerRef = el} />
 * }
 * ```
 *
 * @public
 */
export const createWavesurfer = (
  props: WaveSurferOptions
): {
  isReady: Accessor<boolean>;
  isPlaying: Accessor<boolean>;
  currentTime: Accessor<number>;
  wavesurfer: Accessor<WaveSurfer | null>;
} => {
  const [local, options] = splitProps(props, ["container"]);

  createEffect(() => console.log(local.container));

  const wavesurfer = createWavesurferInstance(local.container, options);
  createEffect(() => console.log(wavesurfer()));
  const state = createWavesurferState(wavesurfer);
  return { ...state, wavesurfer };
};
