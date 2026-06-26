"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { usePlayerStore } from "@/stores/playerStore";
import { useAuthStore } from "@/stores/authStore";
import { getApiBaseUrl } from "@/lib/api";

interface PresenceEntry {
  userId: string;
  trackId: string;
  title: string;
  artist: string;
  startedAt: number;
}

let socket: Socket | null = null;

function getSocket() {
  if (!socket) {
    const base = getApiBaseUrl().replace(/\/api$/, "");
    socket = io(`${base}/presence`, { withCredentials: true, transports: ["websocket"] });
  }
  return socket;
}

// Broadcasts current user's playback state to the presence namespace
export function usePresenceBroadcast() {
  const { currentTrack, isPlaying } = usePlayerStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    const s = getSocket();
    if (isPlaying && currentTrack) {
      s.emit("presence:update", { userId: user.id, trackId: currentTrack.id, title: currentTrack.title, artist: currentTrack.artist });
    } else {
      s.emit("presence:clear", { userId: user.id });
    }
  }, [currentTrack, isPlaying, user]);
}

// Returns the currently-listening track for a specific userId
export function useUserPresence(userId: string): PresenceEntry | null {
  const [presence, setPresence] = useState<PresenceEntry | null>(null);

  useEffect(() => {
    const s = getSocket();
    s.emit("presence:get", { userId }, (entry: PresenceEntry | null) => setPresence(entry));

    const onUpdated = (entry: PresenceEntry) => { if (entry.userId === userId) setPresence(entry); };
    const onCleared = (data: { userId: string }) => { if (data.userId === userId) setPresence(null); };

    s.on("presence:updated", onUpdated);
    s.on("presence:cleared", onCleared);
    return () => { s.off("presence:updated", onUpdated); s.off("presence:cleared", onCleared); };
  }, [userId]);

  return presence;
}
