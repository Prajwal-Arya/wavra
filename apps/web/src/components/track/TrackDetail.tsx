"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { api, unwrapData } from "@/lib/api";
import { usePlayer } from "@/hooks/usePlayer";
import { Waveform } from "@/components/player/Waveform";
import { CommentSection } from "@/components/track/CommentSection";
import { EmbedCode } from "@/components/track/EmbedCode";
import type { Track, TrackReaction } from "@/types";

export function TrackDetail({ trackId }: { trackId: string }) {
  const play = usePlayer((state) => state.play);
  const [track, setTrack] = useState<Track | null>(null);
  const [reactions, setReactions] = useState<TrackReaction[]>([]);

  useEffect(() => {
    api.get<{ data: Track }>(`/tracks/${trackId}`).then((response) => setTrack(unwrapData(response)));
    api.get<{ data: TrackReaction[] }>(`/tracks/${trackId}/reactions`).then((response) => setReactions(unwrapData(response))).catch(() => setReactions([]));
  }, [trackId]);

  if (!track) return <p className="text-sm text-zinc-400">Loading track...</p>;

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-md p-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
          {track.genre && <span>{track.genre}</span>}
          {track.mood && <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs capitalize">{track.mood}</span>}
          {track.bpm && <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs">{track.bpm} BPM</span>}
        </div>
        <h1 className="mt-2 text-3xl font-bold">{track.title}</h1>
        <p className="mt-1 text-zinc-400">{track.artist}</p>
        <button className="mt-5 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black" onClick={() => play(track, [track])}>
          <Play size={18} /> Play
        </button>
      </section>
      <section className="glass-card rounded-md p-5">
        <h2 className="mb-4 text-lg font-semibold">Waveform Reactions</h2>
        <Waveform data={track.waveformData} duration={track.durationSeconds} reactions={reactions} />
      </section>
      <CommentSection trackId={track.id} />
      <EmbedCode trackId={track.id} />
    </div>
  );
}
