"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { api, unwrapData } from "@/lib/api";
import type { Playlist } from "@/types";

export function AiPlaylistGenerator() {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = String(new FormData(event.currentTarget).get("prompt") ?? "").trim();
    if (!prompt) return;
    setIsLoading(true);
    setMessage("");
    try {
      const response = await api.post<{ data: Playlist }>("/playlists/ai-generate", { prompt });
      setPlaylist(unwrapData(response));
      event.currentTarget.reset();
    } catch {
      setMessage("Log in to generate playlists.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="glass-card rounded-md p-5">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-accent" />
        <h2 className="text-lg font-bold">AI Playlist</h2>
      </div>
      <form className="flex gap-3" onSubmit={submit}>
        <input name="prompt" className="h-10 flex-1 rounded-md border border-white/10 bg-surface px-3 text-sm outline-none focus:border-accent" placeholder="songs for coding at 2am" />
        <button className="rounded-md bg-white px-4 text-sm font-semibold text-black" disabled={isLoading}>{isLoading ? "Making..." : "Generate"}</button>
      </form>
      {playlist ? <Link className="mt-3 block text-sm text-accent" href={`/playlist/${playlist.id}`}>Open {playlist.name}</Link> : null}
      {message ? <p className="mt-3 text-sm text-coral">{message}</p> : null}
    </section>
  );
}
