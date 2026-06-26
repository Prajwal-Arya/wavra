"use client";

import { Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { formatDuration } from "@/lib/utils";
import { usePlayer } from "@/hooks/usePlayer";
import { AudioPlayer } from "@/components/player/AudioPlayer";
import { usePresenceBroadcast } from "@/hooks/usePresence";
import { Equalizer } from "@/components/player/Equalizer";
import { ProgressBar } from "@/components/player/ProgressBar";
import { QueueDrawer } from "@/components/player/QueueDrawer";
import { ReactionBar } from "@/components/player/ReactionBar";
import { SleepTimer } from "@/components/player/SleepTimer";
import { VolumeControl } from "@/components/player/VolumeControl";

export function PlayerBar() {
  const player = usePlayer();
  usePresenceBroadcast();

  const title    = player.currentTrack?.title  ?? "Nothing playing";
  const artist   = player.currentTrack?.artist ?? "Pick a track to start";
  const hasTrack = Boolean(player.currentTrack);
  const initial  = player.currentTrack?.title?.slice(0, 1).toUpperCase() ?? "♪";

  function seek(value: number) {
    player.seek(value);
    window.dispatchEvent(new CustomEvent("soundnest:seek", { detail: value }));
  }

  return (
    <footer
      style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30, height: "5rem" }}
      className="border-t border-white/[0.07] bg-[#07070f]/90 backdrop-blur-3xl"
    >
      {/* Thin tinted progress stripe at very top of bar */}
      {hasTrack && (
        <div
          className="absolute left-0 top-0 h-[2px] bg-gradient-to-r from-accent via-violet to-amber transition-[width] duration-300"
          style={{ width: `${player.progress}%` }}
        />
      )}

      <AudioPlayer />

      <div className="
        mx-auto grid h-full max-w-screen-2xl items-center gap-4 px-4
        grid-cols-[minmax(0,1fr)]
        md:grid-cols-[minmax(0,1fr)_minmax(22rem,42rem)_minmax(10rem,1fr)]
        md:px-6
      ">
        {/* ── Track info ─────────────────────────────────── */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="
            relative h-11 w-11 shrink-0 overflow-hidden rounded-lg
            border border-white/[0.08]
            bg-gradient-to-br from-accent/30 to-violet/20
            flex items-center justify-center
            text-base font-black text-white/30
          ">
            {initial}
            {/* Equalizer animation when playing */}
            {hasTrack && player.isPlaying && (
              <div className="absolute inset-0 flex items-end justify-center gap-[2px] bg-black/40 p-1.5">
                {[1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="w-[3px] rounded-full bg-violet"
                    style={{
                      height: `${25 + i * 18}%`,
                      animation: `float ${0.45 + i * 0.15}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <button
            className="min-w-0 text-left disabled:cursor-default"
            onClick={player.toggleTurntableMode}
            disabled={!hasTrack}
            title={hasTrack ? "Open turntable" : undefined}
          >
            <p className="truncate text-sm font-semibold text-zinc-100 leading-tight">{title}</p>
            <p className="truncate text-xs text-zinc-500 mt-0.5">{artist}</p>
          </button>
        </div>

        {/* ── Playback controls ──────────────────────────── */}
        <div className="hidden flex-col items-center gap-2 md:flex">
          <div className="flex items-center gap-1">
            <button
              className={`grid h-8 w-8 place-items-center rounded-full transition-colors disabled:opacity-30 ${player.shuffle ? "text-violet" : "text-zinc-500 hover:text-zinc-200"}`}
              onClick={player.toggleShuffle}
              disabled={!hasTrack}
              aria-label="Shuffle"
            >
              <Shuffle size={15} />
            </button>

            <button
              className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-30"
              aria-label="Previous"
              onClick={player.prev}
              disabled={!hasTrack}
            >
              <SkipBack size={17} />
            </button>

            <button
              className="
                grid h-11 w-11 place-items-center rounded-full
                bg-gradient-to-br from-violet-400 to-accent
                text-white shadow-glow
                transition-all hover:scale-105 active:scale-95
                disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100
              "
              aria-label={player.isPlaying ? "Pause" : "Play"}
              onClick={player.isPlaying ? player.pause : player.resume}
              disabled={!hasTrack}
            >
              {player.isPlaying ? <Pause size={19} /> : <Play size={19} />}
            </button>

            <button
              className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 hover:text-zinc-100 transition-colors disabled:opacity-30"
              aria-label="Next"
              onClick={player.next}
              disabled={!hasTrack}
            >
              <SkipForward size={17} />
            </button>

            <button
              className={`grid h-8 w-8 place-items-center rounded-full transition-colors disabled:opacity-30 ${player.repeat !== "off" ? "text-violet" : "text-zinc-500 hover:text-zinc-200"}`}
              onClick={player.toggleRepeat}
              disabled={!hasTrack}
              aria-label="Repeat"
            >
              <Repeat size={15} />
            </button>
          </div>

          {/* Progress */}
          <div className="flex w-full items-center gap-2 text-[11px] text-zinc-600">
            <span className="w-9 text-right tabular-nums">
              {formatDuration((player.progress / 100) * player.duration)}
            </span>
            <ProgressBar progress={hasTrack ? player.progress : 0} onSeek={seek} />
            <span className="w-9 tabular-nums">{formatDuration(player.duration)}</span>
          </div>
        </div>

        {/* ── Right controls ─────────────────────────────── */}
        <div className="hidden items-center justify-end gap-1 md:flex">
          <Equalizer />
          <SleepTimer />
          <QueueDrawer />
          <ReactionBar />
          <span className="mx-1 h-4 w-px bg-white/[0.08]" />
          <VolumeControl />
        </div>
      </div>
    </footer>
  );
}
