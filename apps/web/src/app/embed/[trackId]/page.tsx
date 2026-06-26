"use client";

import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import { api, getApiBaseUrl, unwrapData } from "@/lib/api";
import type { Track } from "@/types";

export default function EmbedTrackPage({ params }: { params: { trackId: string } }) {
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    api.get<{ data: Track }>(`/tracks/${params.trackId}`).then((response) => setTrack(unwrapData(response))).catch(() => undefined);
  }, [params.trackId]);

  if (!track) return <div className="grid min-h-screen place-items-center bg-page text-sm text-zinc-400">Loading...</div>;

  return (
    <main className="grid min-h-screen place-items-center bg-page p-4">
      <div className="glass-card flex w-full max-w-xl items-center gap-4 rounded-md p-4">
        <button className="grid h-12 w-12 place-items-center rounded-full bg-white text-black" onClick={() => document.querySelector("audio")?.play()}>
          <Play size={18} />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{track.title}</p>
          <p className="truncate text-sm text-zinc-400">{track.artist}</p>
          <audio className="mt-2 w-full" controls src={`${getApiBaseUrl()}/stream/${track.id}`} />
        </div>
      </div>
    </main>
  );
}
