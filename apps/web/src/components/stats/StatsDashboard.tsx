"use client";

import { useEffect, useState } from "react";
import { api, unwrapData } from "@/lib/api";

interface Stats {
  totalListeningMinutes: number;
  totalTracksPlayed: number;
  uniqueTracksPlayed: number;
  currentStreak: number;
  longestStreak: number;
  topGenre: string | null;
  peakHour: number | null;
  averageDailyMinutes: number;
  genreDistribution: Array<{ genre: string; percentage: number }>;
  topTrack: { track: { title: string; artist: string }; playCount: number } | null;
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-card rounded-md p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ data: Stats }>("/users/me/stats")
      .then((response) => setStats(unwrapData(response)))
      .catch(() => setError("Log in and play a few tracks to build your stats."));
  }, []);

  if (error) return <p className="text-sm text-coral">{error}</p>;
  if (!stats) return <p className="text-sm text-zinc-400">Loading stats...</p>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Listening minutes" value={stats.totalListeningMinutes} />
        <StatCard label="Tracks played" value={stats.totalTracksPlayed} />
        <StatCard label="Unique tracks" value={stats.uniqueTracksPlayed} />
        <StatCard label="Current streak" value={`${stats.currentStreak} days`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass-card rounded-md p-5">
          <h2 className="text-lg font-semibold">Top Track</h2>
          <p className="mt-4 text-2xl font-bold">{stats.topTrack?.track.title ?? "No plays yet"}</p>
          <p className="text-sm text-zinc-400">{stats.topTrack?.track.artist ?? "Start listening to build history"}</p>
        </section>
        <section className="glass-card rounded-md p-5">
          <h2 className="text-lg font-semibold">Genres</h2>
          <div className="mt-4 space-y-3">
            {stats.genreDistribution.length ? stats.genreDistribution.map((item) => (
              <div key={item.genre}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.genre}</span>
                  <span className="text-zinc-400">{item.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${item.percentage}%` }} />
                </div>
              </div>
            )) : <p className="text-sm text-zinc-400">No genre data yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
