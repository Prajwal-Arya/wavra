"use client";

import { useEffect, useState } from "react";
import { api, unwrapData } from "@/lib/api";
import type { Activity } from "@/types";

export default function FeedPage() {
  const [items, setItems] = useState<Activity[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get<{ data: Activity[] }>("/feed").then((response) => setItems(unwrapData(response))).catch(() => setMessage("Log in and follow users to build your feed."));
  }, []);

  return (
    <div className="space-y-5 p-4 md:p-8">
      <h1 className="text-2xl font-bold">Activity Feed</h1>
      {message ? <p className="text-sm text-zinc-400">{message}</p> : null}
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="glass-card rounded-md p-4">
            <p className="text-sm"><span className="font-semibold">@{item.user?.username ?? "someone"}</span> {item.type.replace("_", " ")} {item.targetType}</p>
            <p className="mt-1 text-xs text-zinc-500">{new Date(item.createdAt).toLocaleString()}</p>
          </article>
        ))}
        {!items.length && !message ? <p className="text-sm text-zinc-400">No activity yet.</p> : null}
      </div>
    </div>
  );
}
