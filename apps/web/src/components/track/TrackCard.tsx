"use client";

import { Play, Plus } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";
import type { Track } from "@/types";

const PALETTES = [
  { from: "#6d28d9", to: "#4338ca" }, // violet → indigo
  { from: "#0891b2", to: "#1d4ed8" }, // cyan → blue
  { from: "#059669", to: "#0891b2" }, // emerald → cyan
  { from: "#d97706", to: "#b45309" }, // amber → darker amber
  { from: "#db2777", to: "#9333ea" }, // pink → purple
  { from: "#dc2626", to: "#b45309" }, // red → orange
];

function paletteFor(title: string) {
  const seed = title.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return PALETTES[seed % PALETTES.length];
}

export function TrackCard({ track, queue }: { track: Track; queue: Track[] }) {
  const { play, addToQueue } = usePlayer();
  const palette = paletteFor(track.title);

  return (
    <article className="
      group relative flex flex-col rounded-2xl
      bg-white/[0.03] border border-white/[0.06]
      p-3 cursor-default
      transition-all duration-200
      hover:bg-white/[0.06] hover:border-white/[0.1]
      hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]
    ">
      {/* Cover art */}
      <div className="relative mb-3 aspect-square overflow-hidden rounded-xl">
        {/* Gradient background */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})` }}
        />
        {/* Noise grain overlay */}
        <div className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "120px",
          }}
        />
        {/* Letter initial */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-black text-white/20 select-none">
            {track.title.slice(0, 1).toUpperCase()}
          </span>
        </div>
        {/* Bottom shadow */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {/* Play — slides up on hover */}
        <button
          onClick={() => play(track, queue)}
          aria-label={`Play ${track.title}`}
          className="
            absolute bottom-2.5 right-2.5
            grid h-10 w-10 place-items-center rounded-full
            bg-white text-black
            shadow-[0_4px_16px_rgba(0,0,0,0.4)]
            opacity-0 translate-y-2
            group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-200
            hover:scale-105 active:scale-95
          "
        >
          <Play size={17} fill="currentColor" />
        </button>
      </div>

      {/* Info row */}
      <div className="flex min-w-0 items-start gap-2 px-0.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-snug text-zinc-100">
            {track.title}
          </p>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{track.artist}</p>
          {track.genre && (
            <span className="
              mt-1.5 inline-block rounded-full
              bg-white/[0.06] px-2 py-0.5
              text-[10px] font-medium text-zinc-500
            ">
              {track.genre}
            </span>
          )}
        </div>

        <button
          onClick={(e) => { e.stopPropagation(); addToQueue(track); }}
          aria-label="Add to queue"
          className="
            mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full
            text-zinc-600 opacity-0 group-hover:opacity-100
            hover:bg-white/[0.07] hover:text-zinc-200
            transition-all duration-150
          "
        >
          <Plus size={14} />
        </button>
      </div>
    </article>
  );
}
