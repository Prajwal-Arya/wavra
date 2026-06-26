"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, unwrapData } from "@/lib/api";
import { useDebounce } from "@/hooks/useDebounce";
import { TrackRow } from "@/components/track/TrackRow";
import { SearchInput } from "@/components/search/SearchInput";
import type { Playlist, Track, User } from "@/types";

interface SearchPayload {
  tracks: Track[];
  playlists: Playlist[];
  users: User[];
}

const tabs = ["all", "track", "playlist", "user"] as const;

export function SearchResults() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams?.get("q") ?? "");
  const [type, setType] = useState<(typeof tabs)[number]>("all");
  const [results, setResults] = useState<SearchPayload>({ tracks: [], playlists: [], users: [] });
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 250);
  const hasQuery = debouncedQuery.trim().length > 0;

  useEffect(() => {
    setQuery(searchParams?.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    if (!hasQuery) {
      setResults({ tracks: [], playlists: [], users: [] });
      return;
    }

    setIsLoading(true);
    api
      .get<{ data: SearchPayload }>("/search", { params: { q: debouncedQuery, type } })
      .then((response) => setResults(unwrapData(response)))
      .catch(() => setResults({ tracks: [], playlists: [], users: [] }))
      .finally(() => setIsLoading(false));
  }, [debouncedQuery, hasQuery, type]);

  const empty = useMemo(() => !results.tracks.length && !results.playlists.length && !results.users.length, [results]);

  return (
    <div>
      <div className="max-w-2xl">
        <SearchInput value={query} onChange={setQuery} placeholder="Search by title, artist, playlist, or user" />
      </div>
      <div className="mt-8 flex gap-2">
        {tabs.map((tab) => (
          <button key={tab} className={`rounded-md border border-white/10 px-4 py-2 text-sm ${type === tab ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10"}`} onClick={() => setType(tab)}>
            {tab[0].toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>
      <div className="mt-8 space-y-8">
        {isLoading ? <p className="text-sm text-zinc-400">Searching...</p> : null}
        {hasQuery && empty && !isLoading ? <p className="text-sm text-zinc-400">No results found.</p> : null}
        {results.tracks.length ? (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Tracks</h2>
            <div className="rounded-md border border-white/10 bg-panel px-4">
              {results.tracks.map((track) => (
                <TrackRow key={track.id} track={track} />
              ))}
            </div>
          </section>
        ) : null}
        {results.playlists.length ? (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Playlists</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.playlists.map((playlist) => (
                <div key={playlist.id} className="rounded-md border border-white/10 bg-surface p-4">
                  <p className="font-medium">{playlist.name}</p>
                  <p className="text-sm text-zinc-400">{playlist.description}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {results.users.length ? (
          <section>
            <h2 className="mb-3 text-lg font-semibold">Users</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {results.users.map((user) => (
                <div key={user.id} className="rounded-md border border-white/10 bg-surface p-4">
                  <p className="font-medium">{user.displayName || user.username}</p>
                  <p className="text-sm text-zinc-400">@{user.username}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
