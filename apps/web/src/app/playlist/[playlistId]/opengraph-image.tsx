import { ImageResponse } from "next/og";
import type { Playlist } from "@/types";

export const runtime = "edge";
export const alt = "Playlist on SoundNest";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: { playlistId: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  let playlist: Partial<Playlist> = { name: "Playlist", description: "" };
  try {
    const res = await fetch(`${baseUrl}/playlists/${params.playlistId}`, { cache: "no-store" });
    const payload = (await res.json()) as { data: Playlist };
    playlist = payload.data;
  } catch { /* fallback above */ }

  const trackCount = playlist.playlistTracks?.length ?? playlist.tracks?.length ?? 0;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(135deg, #0a0a0a 0%, #0a1a2e 50%, #0a0a0a 100%)",
        alignItems: "center",
        padding: "60px",
        gap: "48px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: 220,
          height: 220,
          borderRadius: 16,
          background: "linear-gradient(135deg, #7c3aed, #ec4899)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 72,
        }}
      >
        🎵
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ fontSize: 14, color: "#22c55e", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>SoundNest · Playlist</div>
        <div style={{ fontSize: 52, fontWeight: 800, color: "#ffffff", lineHeight: 1.1 }}>{playlist.name}</div>
        {playlist.description && <div style={{ fontSize: 24, color: "#a1a1aa", fontWeight: 400 }}>{playlist.description}</div>}
        <div style={{ fontSize: 18, color: "#71717a", marginTop: 8 }}>
          {trackCount > 0 ? `${trackCount} track${trackCount === 1 ? "" : "s"}` : ""}
          {playlist.owner?.displayName ? ` · by ${playlist.owner.displayName}` : ""}
        </div>
        <div style={{ fontSize: 18, color: "#52525b", marginTop: "auto" }}>Listen on SoundNest →</div>
      </div>
    </div>,
    { ...size }
  );
}
