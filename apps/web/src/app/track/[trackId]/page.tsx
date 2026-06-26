import { TrackDetail } from "@/components/track/TrackDetail";
import type { Metadata } from "next";
import type { Track } from "@/types";

export async function generateMetadata({ params }: { params: { trackId: string } }): Promise<Metadata> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
    const response = await fetch(`${baseUrl}/tracks/${params.trackId}`, { cache: "no-store" });
    const payload = await response.json() as { data: Track };
    const track = payload.data;
    return {
      title: `${track.title} - ${track.artist}`,
      description: `Listen to ${track.title} by ${track.artist} on Wavra.`,
      openGraph: {
        title: `${track.title} - ${track.artist}`,
        description: `Listen on Wavra`,
        type: "music.song"
      }
    };
  } catch {
    return { title: "Track - Wavra" };
  }
}

export default function TrackDetailPage({ params }: { params: { trackId: string } }) {
  return (
    <div className="p-4 md:p-8">
      <TrackDetail trackId={params.trackId} />
    </div>
  );
}
