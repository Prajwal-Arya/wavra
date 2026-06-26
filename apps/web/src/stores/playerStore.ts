import { create } from "zustand";
import type { Track } from "@/types";

type RepeatMode = "off" | "one" | "all";

interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  queue: Track[];
  queueIndex: number;
  shuffle: boolean;
  repeat: RepeatMode;
  turntableMode: boolean;
  muted: boolean;
  previousVolume: number;
  sleepTimerEnd: number | null;
  equalizer: number[];
  play: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  prev: () => void;
  seek: (progress: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setSleepTimer: (minutes: number | null) => void;
  setEqualizer: (values: number[]) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  playQueueIndex: (index: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  toggleTurntableMode: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  isPlaying: false,
  progress: 0,
  duration: 0,
  volume: 0.8,
  queue: [],
  queueIndex: -1,
  shuffle: false,
  repeat: "off",
  turntableMode: false,
  muted: false,
  previousVolume: 0.8,
  sleepTimerEnd: null,
  equalizer: [0, 0, 0, 0, 0],
  play: (track, queue) =>
    set({
      currentTrack: track,
      isPlaying: true,
      progress: 0,
      queue: queue ?? get().queue,
      queueIndex: queue ? queue.findIndex((item) => item.id === track.id) : get().queueIndex
    }),
  pause: () => set({ isPlaying: false }),
  resume: () => set({ isPlaying: true }),
  next: () => {
    const { queue, queueIndex, repeat } = get();
    if (!queue.length) return;
    const nextIndex = queueIndex + 1 < queue.length ? queueIndex + 1 : repeat === "all" ? 0 : queueIndex;
    set({ queueIndex: nextIndex, currentTrack: queue[nextIndex], isPlaying: true, progress: 0 });
  },
  prev: () => {
    const { queue, queueIndex } = get();
    if (!queue.length) return;
    const prevIndex = Math.max(queueIndex - 1, 0);
    set({ queueIndex: prevIndex, currentTrack: queue[prevIndex], isPlaying: true, progress: 0 });
  },
  seek: (progress) => set({ progress }),
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume, muted: volume === 0 }),
  toggleMute: () =>
    set((state) => state.muted ? { muted: false, volume: state.previousVolume || 0.8 } : { muted: true, previousVolume: state.volume, volume: 0 }),
  setSleepTimer: (minutes) => set({ sleepTimerEnd: minutes ? Date.now() + minutes * 60_000 : null }),
  setEqualizer: (values) => set({ equalizer: values }),
  addToQueue: (track) => set((state) => ({ queue: [...state.queue, track] })),
  removeFromQueue: (index) =>
    set((state) => {
      const queue = state.queue.filter((_, itemIndex) => itemIndex !== index);
      const queueIndex = index < state.queueIndex ? state.queueIndex - 1 : index === state.queueIndex ? -1 : state.queueIndex;
      return {
        queue,
        queueIndex,
        currentTrack: index === state.queueIndex ? null : state.currentTrack,
        isPlaying: index === state.queueIndex ? false : state.isPlaying
      };
    }),
  clearQueue: () => set({ queue: [], queueIndex: -1, currentTrack: null, isPlaying: false, progress: 0 }),
  playQueueIndex: (index) => {
    const queue = get().queue;
    const track = queue[index];
    if (!track) return;
    set({ currentTrack: track, queueIndex: index, isPlaying: true, progress: 0 });
  },
  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),
  toggleRepeat: () =>
    set((state) => ({ repeat: state.repeat === "off" ? "all" : state.repeat === "all" ? "one" : "off" })),
  toggleTurntableMode: () => set((state) => ({ turntableMode: !state.turntableMode }))
}));
