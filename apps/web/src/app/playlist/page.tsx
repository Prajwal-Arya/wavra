import { PlaylistManager } from "@/components/playlist/PlaylistManager";

export default function PlaylistsPage() {
  return (
    <div className="p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-bold">Playlists</h1>
      <PlaylistManager />
    </div>
  );
}
