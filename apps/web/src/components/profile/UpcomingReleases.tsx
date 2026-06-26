"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { api, unwrapData } from "@/lib/api";
import type { Track } from "@/types";

function useCountdown(target: string | undefined) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (!target) return;
    const update = () => {
      const diff = new Date(target).getTime() - Date.now();
      if (diff <= 0) { setLabel("Out now!"); return; }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setLabel(d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  return label;
}

function CountdownTimer({ releaseAt }: { releaseAt: string }) {
  const label = useCountdown(releaseAt);
  return (
    <span className="flex items-center gap-1 text-sm text-accent">
      <Clock size={13} />
      {label}
    </span>
  );
}

export function UpcomingReleases({ userId }: { userId: string }) {
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    api.get<{ data: Track[] }>(`/users/${userId}/upcoming`).then((response) => setTracks(unwrapData(response))).catch(() => setTracks([]));
  }, [userId]);

  if (!tracks.length) return null;

  return (
    <section>
      <h2 className="mb-3 text-xl font-bold">Upcoming Releases</h2>
      <div className="grid gap-3">
        {tracks.map((track) => (
          <article key={track.id} className="glass-card flex items-center justify-between gap-4 rounded-md p-4">
            <div>
              <p className="font-semibold">{track.title}</p>
              <p className="text-xs text-zinc-400">{track.scheduledReleaseAt ? new Date(track.scheduledReleaseAt).toLocaleDateString(undefined, { dateStyle: "long" }) : "Coming soon"}</p>
            </div>
            {track.scheduledReleaseAt && <CountdownTimer releaseAt={track.scheduledReleaseAt} />}
          </article>
        ))}
      </div>
    </section>
  );
}
