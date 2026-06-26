"use client";

import type { TrackReaction } from "@/types";

export function Waveform({ data = [], duration, reactions = [] }: { data?: number[]; duration: number; reactions?: TrackReaction[] }) {
  const values = data.length ? data : Array.from({ length: 150 }, () => 0.08);

  return (
    <div className="relative h-28 overflow-hidden rounded-md border border-white/10 bg-black/25 p-4">
      <div className="flex h-full items-center gap-[2px]">
        {values.map((value, index) => (
          <div key={index} className="flex h-full flex-1 items-center">
            <span className="w-full rounded-full bg-accent/70" style={{ height: `${Math.max(8, value * 100)}%` }} />
          </div>
        ))}
      </div>
      {reactions.map((reaction) => (
        <span
          key={reaction.id}
          className="absolute top-3 -translate-x-1/2 rounded-full bg-black/65 px-2 py-1 text-xs shadow-lg"
          style={{ left: `${Math.min(100, (reaction.timestamp / Math.max(duration || 1, 1)) * 100)}%` }}
          title={`${reaction.emoji} at ${reaction.timestamp}s`}
        >
          {reaction.emoji}
        </span>
      ))}
    </div>
  );
}
