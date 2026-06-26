import type { Track } from "@/types";
import { formatDuration } from "@/lib/utils";

export function TrackRow({ track }: { track: Track }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 border-b border-white/10 py-3 text-sm">
      <div className="min-w-0">
        <p className="truncate font-medium">{track.title}</p>
        <p className="truncate text-xs text-zinc-400">{track.artist}</p>
      </div>
      <span className="text-zinc-500">{formatDuration(track.durationSeconds)}</span>
    </div>
  );
}
