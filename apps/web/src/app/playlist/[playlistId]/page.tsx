import { PlaylistDetail } from "@/components/playlist/PlaylistDetail";

export default function PlaylistDetailPage({ params }: { params: { playlistId: string } }) {
  return (
    <div className="p-4 md:p-8">
      <PlaylistDetail playlistId={params.playlistId} />
    </div>
  );
}
