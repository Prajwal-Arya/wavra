"use client";

import { useEffect, useState } from "react";
import { api, unwrapData } from "@/lib/api";
import type { Track } from "@/types";

const tabs = [
  { id: "trending_tracks", label: "Trending Tracks" },
  { id: "top_uploaders", label: "Top Uploaders" },
  { id: "top_listeners", label: "Top Listeners" }
];

export default function LeaderboardsPage() {
  const [type, setType] = useState(tabs[0].id);
  const [items, setItems] = useState<unknown[]>([]);

  useEffect(() => {
    api.get<{ data: unknown[] }>(`/leaderboards/${type}`).then((response) => setItems(unwrapData(response))).catch(() => setItems([]));
  }, [type]);

  return (
    <div className="space-y-5 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Leaderboards</h1>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => <button key={tab.id} className={`rounded-md px-3 py-2 text-sm ${type === tab.id ? "bg-white text-black" : "glass-soft"}`} onClick={() => setType(tab.id)}>{tab.label}</button>)}
      </div>
      <div className="glass-card rounded-md p-4">
        {items.map((item, index) => {
          const track = item as Track;
          const row = item as Record<string, string | number | undefined>;
          return (
            <div key={track.id ?? row.id ?? index} className="flex items-center justify-between border-b border-white/10 py-3 last:border-b-0">
              <div>
                <p className="text-sm font-semibold">#{index + 1} {track.title ?? row.username ?? row.displayName ?? "Entry"}</p>
                <p className="text-xs text-zinc-400">{track.artist ?? (row.score ? `${row.score} points` : "")}</p>
              </div>
              {"playCount" in track ? <span className="text-sm text-zinc-400">{track.playCount} plays</span> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
