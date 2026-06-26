"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, unwrapData } from "@/lib/api";
import { createPlaylistSocket } from "@/lib/realtime";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TrackRow } from "@/components/track/TrackRow";
import type { Playlist, Track } from "@/types";

export function PlaylistDetail({ playlistId }: { playlistId: string }) {
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [votes, setVotes] = useState<Array<{ trackId: string; score: number }>>([]);
  const [invite, setInvite] = useState<string | null>(null);

  function load() {
    api.get<{ data: Playlist }>(`/playlists/${playlistId}`).then((response) => setPlaylist(unwrapData(response)));
    api.get<{ data: Track[] }>("/tracks").then((response) => setTracks(unwrapData(response))).catch(() => setTracks([]));
    api.get<{ data: Array<{ trackId: string; score: number }> }>(`/playlists/${playlistId}/votes`).then((response) => setVotes(unwrapData(response))).catch(() => setVotes([]));
  }

  useEffect(load, [playlistId]);

  useEffect(() => {
    const socket = createPlaylistSocket();
    socket.emit("playlist:join", playlistId);
    socket.on("playlist:updated", load);
    return () => {
      socket.emit("playlist:leave", playlistId);
      socket.disconnect();
    };
  }, [playlistId]);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.post(`/playlists/${playlistId}/tracks/${form.get("trackId")}`);
    event.currentTarget.reset();
    load();
  }

  async function vote(trackId: string, value: number) {
    const response = await api.post<{ data: Array<{ trackId: string; score: number }> }>(`/playlists/${playlistId}/tracks/${trackId}/vote`, { value });
    setVotes(unwrapData(response));
  }

  async function generateInvite() {
    const response = await api.post<{ data: { inviteCode: string } }>(`/playlists/${playlistId}/invite`);
    setInvite(unwrapData(response).inviteCode);
  }

  if (!playlist) return <p className="text-sm text-zinc-400">Loading playlist...</p>;

  return (
    <div className="space-y-6">
      <section className="glass-card rounded-md p-5">
        <p className="text-sm text-zinc-400">Playlist</p>
        <h1 className="mt-2 text-3xl font-bold">{playlist.name}</h1>
        <p className="mt-2 text-zinc-400">{playlist.description}</p>
        <div className="mt-4 flex gap-3">
          <Button type="button" onClick={() => void generateInvite()}>Invite</Button>
          {invite ? <p className="self-center text-sm text-zinc-300">Invite code: <span className="font-semibold text-white">{invite}</span></p> : null}
        </div>
      </section>
      <form className="glass-card flex gap-3 rounded-md p-4" onSubmit={add}>
        <select name="trackId" className="h-10 flex-1 rounded-md border border-white/10 bg-surface px-3 text-sm text-white">
          {tracks.map((track) => <option key={track.id} value={track.id}>{track.title} - {track.artist}</option>)}
        </select>
        <Button type="submit">Add Track</Button>
      </form>
      <section className="glass-card rounded-md px-4">
        {playlist.playlistTracks?.length ? playlist.playlistTracks.map((item) => {
          const score = votes.find((voteItem) => voteItem.trackId === item.track.id)?.score ?? 0;
          return (
            <div key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-white/10">
              <TrackRow track={item.track} />
              <div className="flex items-center gap-2">
                <button className="rounded-md bg-white/10 px-2 py-1" onClick={() => void vote(item.track.id, 1)}>+</button>
                <span className="w-6 text-center text-sm">{score}</span>
                <button className="rounded-md bg-white/10 px-2 py-1" onClick={() => void vote(item.track.id, -1)}>-</button>
              </div>
            </div>
          );
        }) : <p className="py-5 text-sm text-zinc-400">No tracks yet.</p>}
      </section>
    </div>
  );
}
