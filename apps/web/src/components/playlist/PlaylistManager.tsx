"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { api, unwrapData } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AiPlaylistGenerator } from "@/components/playlist/AiPlaylistGenerator";
import type { Playlist } from "@/types";

export function PlaylistManager() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  function load() {
    api.get<{ data: Playlist[] }>("/playlists").then((response) => setPlaylists(unwrapData(response))).catch(() => setMessage("Could not load playlists."));
  }

  useEffect(load, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post("/playlists", {
      name: String(form.get("name")),
      description: String(form.get("description") || ""),
      isPublic: true,
      isCollaborative: form.get("isCollaborative") === "on"
    });
    event.currentTarget.reset();
    load();
  }

  return (
    <div className="space-y-6">
      <AiPlaylistGenerator />
      <form className="glass-card grid gap-3 rounded-md p-5 md:grid-cols-[1fr_1fr_auto_auto]" onSubmit={create}>
        <Input name="name" placeholder="Playlist name" required />
        <Input name="description" placeholder="Description" />
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input name="isCollaborative" type="checkbox" /> Collaborative
        </label>
        <Button type="submit">Create</Button>
      </form>
      {message ? <p className="text-sm text-coral">{message}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {playlists.map((playlist) => (
          <Link key={playlist.id} href={`/playlist/${playlist.id}`} className="glass-card rounded-md p-5 hover:bg-white/10">
            <h2 className="font-semibold">{playlist.name}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{playlist.description || "No description"}</p>
            <p className="mt-3 text-xs text-zinc-500">{playlist.isCollaborative ? "Collaborative" : "Standard"}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
