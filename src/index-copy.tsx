import {
  JSX,
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  splitProps,
} from "solid-js";
import WaveSurfer, { WaveSurferEvents, WaveSurferOptions } from "wavesurfer.js";

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

export type WavesurferProps = PartialWavesurferOptions & OnWavesurferEvents;

function createWavesurferInstance(
  container: HTMLElement,
  options: Partial<WaveSurferOptions>
) {
  const [wavesurfer, setWavesurfer] = createSignal<WaveSurfer | null>(null);

  createEffect(() => {
    if (!container()) return;
    const ws = WaveSurfer.create({
      ...options,
      container: container(),
    });

    setWavesurfer(ws);

    onCleanup(() => {
      ws.destroy();
    });
  });

  return wavesurfer;
}

function createWavesurferState(wavesurfer: () => WaveSurfer | null) {
  const [isReady, setIsReady] = createSignal(false);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [currentTime, setCurrentTime] = createSignal(0);

  createEffect(() => {
    const ws = wavesurfer();
    if (!ws) return;

    const handlers = {
      load: () => {
        setIsReady(false);
        setIsPlaying(false);
        setCurrentTime(0);
      },
      ready: () => {
        setIsReady(true);
        setIsPlaying(false);
        setCurrentTime(0);
      },
      play: () => setIsPlaying(true),
      pause: () => setIsPlaying(false),
      timeupdate: () => setCurrentTime(ws.getCurrentTime()),
      destroy: () => {
        setIsReady(false);
        setIsPlaying(false);
      },
    };

    Object.entries(handlers).forEach(([event, handler]) => {
      ws.on(event as keyof WaveSurferEvents, handler);
    });

    onCleanup(() => {
      Object.entries(handlers).forEach(([event, handler]) => {
        ws.un(event as keyof WaveSurferEvents, handler);
      });
    });
  });

  return { isReady, isPlaying, currentTime };
}

const EVENT_PROP_RE = /^on([A-Z])/;
const isEventProp = (key: string) => EVENT_PROP_RE.test(key);
const getEventName = (key: string) =>
  key.replace(EVENT_PROP_RE, (_, $1) =>
    $1.toLowerCase()
  ) as keyof WaveSurferEvents;

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

export function WavesurferPlayer(props: WavesurferProps): JSX.Element {
  let containerRef: HTMLDivElement | undefined;

  const [local, others] = splitProps(
    props,
    Object.keys(props).filter(isEventProp) as (keyof WavesurferProps)[]
  );
  const options = mergeProps(others);
  const events = mergeProps(local);

  const wavesurfer = createWavesurferInstance(() => containerRef!, options);
  createWavesurferEvents(wavesurfer, () => events);

  return <div ref={(el) => (containerRef = el)} />;
}

export function createWavesurfer(props: WaveSurferOptions) {
  const [local, options] = splitProps(props, ["getContainer"]);
  const wavesurfer = createWavesurferInstance(local.getContainer, options);
  createEffect(() => {
    console.log(wavesurfer());
  });
  const state = createWavesurferState(wavesurfer);

  return { ...state, wavesurfer };
}
