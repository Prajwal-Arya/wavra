import type { Track } from "@/types";

export function VinylRecord({ track, isPlaying }: { track: Track | null; isPlaying: boolean }) {
  return (
    <div className={`relative aspect-square w-full max-w-[24rem] rounded-full bg-black shadow-2xl ${isPlaying ? "vinyl-spinning" : "vinyl-spinning vinyl-paused"}`}>
      <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,rgba(255,255,255,0.14)_0_1px,transparent_1px_11px)] opacity-40" />
      <div className="absolute inset-[18%] grid place-items-center rounded-full border border-white/10 bg-[linear-gradient(135deg,#27272a,#111)] text-6xl font-black text-white/80">
        {track?.title?.slice(0, 1) ?? "S"}
      </div>
      <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/40 bg-white" />
    </div>
  );
}
