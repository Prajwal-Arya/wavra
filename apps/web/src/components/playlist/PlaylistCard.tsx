import type { Playlist } from "@/types";

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  return (
    <article className="rounded-md border border-white/10 bg-surface p-5">
      <h3 className="font-semibold">{playlist.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{playlist.description}</p>
    </article>
  );
}
