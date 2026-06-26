import { ImageResponse } from "next/og";
import type { Track } from "@/types";

export const runtime = "edge";
export const alt = "Track on Wavra";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: { trackId: string } }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
  let track: Partial<Track> = { title: "Unknown Track", artist: "Unknown Artist" };
  try {
    const res = await fetch(`${baseUrl}/tracks/${params.trackId}`, { cache: "no-store" });
    const payload = (await res.json()) as { data: Track };
    track = payload.data;
  } catch { /* fallback above */ }

  const coverUrl = track.coverPath
    ? `${baseUrl.replace(/\/api$/, "")}/uploads/covers/${track.coverPath.split("/").pop()}`
    : null;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)",
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
          background: "#1e1e1e",
          flexShrink: 0,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 72,
        }}
      >
        {coverUrl ? <img src={coverUrl} width={220} height={220} style={{ objectFit: "cover" }} alt="" /> : "🎵"}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: "#22c55e", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>Wavra</div>
        <div style={{ fontSize: 52, fontWeight: 800, color: "#ffffff", lineHeight: 1.1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2 }}>
          {track.title}
        </div>
        <div style={{ fontSize: 28, color: "#a1a1aa", fontWeight: 500 }}>{track.artist}</div>
        {track.genre && <div style={{ fontSize: 16, color: "#71717a", marginTop: 8 }}>{track.genre}{track.bpm ? ` · ${track.bpm} BPM` : ""}</div>}
        <div style={{ fontSize: 18, color: "#52525b", marginTop: "auto" }}>Listen on Wavra →</div>
      </div>
    </div>,
    { ...size }
  );
}
