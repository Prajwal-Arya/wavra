"use client";

import { useEffect, useState } from "react";
import { api, unwrapData } from "@/lib/api";

interface UserChallenge {
  id: string;
  progress: number;
  completed: boolean;
  challenge: {
    title: string;
    description: string;
    targetValue: number;
    endsAt: string;
  };
}

export default function ChallengesPage() {
  const [items, setItems] = useState<UserChallenge[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get<{ data: UserChallenge[] }>("/challenges").then((response) => setItems(unwrapData(response))).catch(() => setMessage("Log in to view challenges."));
  }, []);

  return (
    <div className="space-y-5 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Challenges</h1>
      {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const pct = Math.min(100, Math.round((item.progress / item.challenge.targetValue) * 100));
          return (
            <article key={item.id} className="glass-card rounded-md p-5">
              <h2 className="font-semibold">{item.challenge.title}</h2>
              <p className="mt-1 text-sm text-zinc-400">{item.challenge.description}</p>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-xs text-zinc-500">{item.progress}/{item.challenge.targetValue}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
