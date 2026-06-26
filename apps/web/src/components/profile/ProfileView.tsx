"use client";

import { useEffect, useState } from "react";
import { api, getApiBaseUrl, unwrapData } from "@/lib/api";
import { PlaylistCard } from "@/components/playlist/PlaylistCard";
import { BadgeGrid } from "@/components/profile/BadgeGrid";
import { UpcomingReleases } from "@/components/profile/UpcomingReleases";
import { FollowButton } from "@/components/social/FollowButton";
import { TrackRow } from "@/components/track/TrackRow";
import { useAuthStore } from "@/stores/authStore";
import { useUserPresence } from "@/hooks/usePresence";
import type { Playlist, Track, User } from "@/types";

export function ProfileView({ userId }: { userId: string }) {
  const currentUser = useAuthStore((state) => state.user);
  const presence = useUserPresence(userId);
  const [user, setUser] = useState<User | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [message, setMessage] = useState("");
  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    api.get<{ data: User }>(`/users/${userId}`).then((response) => setUser(unwrapData(response))).catch(() => undefined);
    api.get<{ data: Track[] }>(`/users/${userId}/tracks`).then((response) => setTracks(unwrapData(response))).catch(() => setTracks([]));
    api.get<{ data: Playlist[] }>(`/users/${userId}/playlists`).then((response) => setPlaylists(unwrapData(response))).catch(() => setPlaylists([]));
  }, [userId]);

  async function uploadAvatar(file?: File) {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await api.patch<{ data: User }>("/users/me/avatar", formData);
      setUser(unwrapData(response));
      setMessage("Avatar updated.");
    } catch {
      setMessage("Could not update avatar.");
    }
  }

  const avatarUrl = user?.avatarPath ? `${getApiBaseUrl().replace(/\/api$/, "")}/${user.avatarPath.replace(/^apps\/api\/uploads\//, "uploads/")}` : null;

  return (
    <div className="space-y-8">
      <section className="glass-card flex items-center gap-4 rounded-md p-5">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-surface">
          {avatarUrl ? <img className="h-full w-full object-cover" src={avatarUrl} alt="" /> : null}
        </div>
        <div>
          <p className="text-sm text-zinc-400">Profile</p>
          <h1 className="text-2xl font-bold">{user?.displayName || user?.username || userId}</h1>
          <p className="text-xs text-zinc-500">{user?.followersCount ?? 0} followers · {user?.followingCount ?? 0} following {user?.isVerified ? "· Verified" : ""}</p>
          {presence && (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-accent">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Listening to <span className="font-semibold">{presence.title}</span> — {presence.artist}
            </p>
          )}
          <p className="text-sm text-zinc-400">{user?.bio}</p>
          {isOwnProfile ? (
            <label className="mt-3 inline-flex cursor-pointer rounded-md border border-white/10 px-3 py-2 text-sm text-zinc-300 hover:bg-white/10">
              Upload avatar
              <input className="sr-only" type="file" accept="image/*" onChange={(event) => void uploadAvatar(event.target.files?.[0])} />
            </label>
          ) : null}
          {!isOwnProfile ? <div className="mt-3"><FollowButton userId={userId} /></div> : null}
          {message ? <p className="mt-2 text-xs text-zinc-400">{message}</p> : null}
          <BadgeGrid userId={userId} />
        </div>
      </section>
      <UpcomingReleases userId={userId} />
      <section>
        <h2 className="mb-3 text-xl font-bold">Uploads</h2>
        <div className="glass-card rounded-md px-4">
          {tracks.length ? tracks.map((track) => <TrackRow key={track.id} track={track} />) : <p className="py-4 text-sm text-zinc-400">No uploads yet.</p>}
        </div>
      </section>
      <section>
        <h2 className="mb-3 text-xl font-bold">Playlists</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.map((playlist) => <PlaylistCard key={playlist.id} playlist={playlist} />)}
        </div>
      </section>
    </div>
  );
}
