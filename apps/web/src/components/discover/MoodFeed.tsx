"use client";

import { useEffect, useState } from "react";
import { TrackCard } from "@/components/track/TrackCard";
import { api, unwrapData } from "@/lib/api";
import type { Mood } from "@/lib/moods";
import type { Track } from "@/types";

export function MoodFeed({ mood }: { mood: Mood }) {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get<{ data: Track[] }>("/tracks", { params: { mood } })
      .then((response) => setTracks(unwrapData(response)))
      .catch(() => setTracks([]))
      .finally(() => setIsLoading(false));
  }, [mood]);

  if (isLoading) return <p className="text-sm text-zinc-400">Finding {mood} tracks...</p>;
  if (!tracks.length) return <p className="text-sm text-zinc-400">No {mood} tracks yet. Upload one and tag its mood.</p>;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tracks.map((track) => (
        <TrackCard key={track.id} track={track} queue={tracks} />
      ))}
    </div>
  );
}
