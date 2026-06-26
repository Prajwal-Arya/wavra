"use client";

import { useEffect, useState } from "react";
import { api, unwrapData } from "@/lib/api";
import type { Track } from "@/types";

interface Analytics {
  totalTracks: number;
  totalPlays: number;
  averagePlays: number;
  topTrack: Track | null;
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get<{ data: Analytics }>("/users/me/analytics").then((response) => setAnalytics(unwrapData(response))).catch(() => setMessage("Log in to view creator analytics."));
    api.get<{ data: Track[] }>("/users/me/analytics/tracks").then((response) => setTracks(unwrapData(response))).catch(() => setTracks([]));
  }, []);

  return (
    <div className="space-y-6 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Creator Analytics</h1>
      {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
      {analytics ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="glass-card rounded-md p-5"><p className="text-sm text-zinc-400">Tracks</p><p className="text-3xl font-bold">{analytics.totalTracks}</p></div>
          <div className="glass-card rounded-md p-5"><p className="text-sm text-zinc-400">Total plays</p><p className="text-3xl font-bold">{analytics.totalPlays}</p></div>
          <div className="glass-card rounded-md p-5"><p className="text-sm text-zinc-400">Average plays</p><p className="text-3xl font-bold">{analytics.averagePlays}</p></div>
        </div>
      ) : null}
      <section className="glass-card rounded-md p-4">
        <h2 className="mb-3 text-lg font-semibold">Track Performance</h2>
        {tracks.map((track) => (
          <div key={track.id} className="flex justify-between border-b border-white/10 py-3 last:border-b-0">
            <span className="text-sm">{track.title}</span>
            <span className="text-sm text-zinc-400">{track.playCount} plays</span>
          </div>
        ))}
      </section>
    </div>
  );
}
