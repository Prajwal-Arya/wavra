"use client";

import { Volume, Volume1, Volume2, VolumeX } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";

export function VolumeControl() {
  const volume      = usePlayer((state) => state.volume);
  const muted       = usePlayer((state) => state.muted);
  const setVolume   = usePlayer((state) => state.setVolume);
  const toggleMute  = usePlayer((state) => state.toggleMute);

  const Icon = muted || volume === 0
    ? VolumeX
    : volume < 0.33
    ? Volume
    : volume < 0.66
    ? Volume1
    : Volume2;

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <button
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        className="grid h-8 w-8 place-items-center rounded-full text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200 transition-colors"
      >
        <Icon size={16} />
      </button>

      <div className="relative flex w-24 items-center">
        {/* Track fill */}
        <div
          className="pointer-events-none absolute left-0 h-[3px] rounded-full bg-gradient-to-r from-accent to-violet transition-all"
          style={{ width: `${muted ? 0 : volume * 100}%` }}
        />
        <input
          aria-label="Volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
}
