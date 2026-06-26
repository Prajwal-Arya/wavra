"use client";

import { X } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import { VinylRecord } from "@/components/player/VinylRecord";
import { Tonearm } from "@/components/player/Tonearm";

export function VinylTurntable() {
  const player = usePlayer();
  if (!player.turntableMode) return null;

  return (
    <div className="fixed inset-0 z-40 bg-black/80 p-4 backdrop-blur-xl">
      <button className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/10 hover:bg-white/20" onClick={player.toggleTurntableMode} aria-label="Close turntable">
        <X size={20} />
      </button>
      <div className="mx-auto flex h-full max-w-5xl flex-col items-center justify-center gap-8">
        <div className="glass-card relative grid w-full max-w-3xl place-items-center overflow-hidden rounded-md p-10">
          <VinylRecord track={player.currentTrack} isPlaying={player.isPlaying} />
          <Tonearm isPlaying={player.isPlaying && Boolean(player.currentTrack)} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold">{player.currentTrack?.title ?? "Nothing playing"}</h2>
          <p className="text-zinc-400">{player.currentTrack?.artist ?? "Pick a track to start"}</p>
        </div>
      </div>
    </div>
  );
}
