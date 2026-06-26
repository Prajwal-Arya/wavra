"use client";

import { useEffect, useMemo, useState } from "react";
import { api, unwrapData } from "@/lib/api";
import { parseLrc } from "@/lib/lrc-parser";
import { usePlayer } from "@/hooks/usePlayer";

export function LyricsPanel() {
  const currentTrack = usePlayer((state) => state.currentTrack);
  const progress = usePlayer((state) => state.progress);
  const duration = usePlayer((state) => state.duration);
  const [lyrics, setLyrics] = useState("");
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!currentTrack) {
      setLyrics("");
      return;
    }
    api.get<{ data: { lyrics: string; lyricsSynced: boolean } }>(`/tracks/${currentTrack.id}/lyrics`)
      .then((response) => {
        const data = unwrapData(response);
        setLyrics(data.lyrics);
        setSynced(data.lyricsSynced);
      })
      .catch(() => setLyrics(""));
  }, [currentTrack]);

  const lines = useMemo(() => (synced ? parseLrc(lyrics) : []), [lyrics, synced]);
  const currentTime = (progress / 100) * duration;
  const activeIndex = lines.findIndex((line, index) => currentTime >= line.time && currentTime < (lines[index + 1]?.time ?? Number.POSITIVE_INFINITY));

  if (!currentTrack || !lyrics.trim()) return null;

  return (
    <aside className="glass-card fixed bottom-24 right-4 z-20 hidden max-h-80 w-80 overflow-y-auto rounded-md p-4 lg:block">
      <h2 className="mb-3 text-sm font-semibold">Lyrics</h2>
      {synced && lines.length ? (
        <div className="space-y-2">
          {lines.map((line, index) => (
            <p key={`${line.time}-${line.text}`} className={`text-sm ${index === activeIndex ? "text-white" : "text-zinc-500"}`}>{line.text}</p>
          ))}
        </div>
      ) : (
        <p className="whitespace-pre-line text-sm text-zinc-300">{lyrics}</p>
      )}
    </aside>
  );
}
