"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Library, Music2, Play, PlayCircle, Sparkles, TrendingUp } from "lucide-react";
import { TrackCard } from "@/components/track/TrackCard";
import { api, unwrapData } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { usePlayer } from "@/hooks/usePlayer";
import type { Playlist, Track } from "@/types";

/* ── Genre config ─────────────────────────────────────────────────────────── */
const GENRES = [
  { name: "Electronic", icon: "⚡", bg: "from-cyan-900/60 to-blue-900/40",   accent: "#06b6d4" },
  { name: "Ambient",    icon: "🌌", bg: "from-violet-900/60 to-indigo-900/40", accent: "#8b5cf6" },
  { name: "Hip-Hop",    icon: "🎤", bg: "from-amber-900/60 to-orange-900/40",  accent: "#f59e0b" },
  { name: "Indie",      icon: "🎸", bg: "from-emerald-900/60 to-teal-900/40",  accent: "#10b981" },
  { name: "Lo-fi",      icon: "☕", bg: "from-rose-900/60 to-pink-900/40",     accent: "#f43f5e" },
  { name: "House",      icon: "🎹", bg: "from-fuchsia-900/60 to-purple-900/40",accent: "#d946ef" },
];

/* ── Reusable section header ──────────────────────────────────────────────── */
function SectionHeader({
  label, sub, href,
}: { label: string; sub?: string; href?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between">
      <div>
        <h2 className="text-base font-bold text-zinc-100">{label}</h2>
        {sub && <p className="mt-0.5 text-xs text-zinc-600">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-violet transition-colors">
          See all <ArrowRight size={12} />
        </Link>
      )}
    </div>
  );
}

/* ── Horizontal scroll row for track cards ────────────────────────────────── */
function TrackRow({ tracks, queue }: { tracks: Track[]; queue: Track[] }) {
  return (
    <div className="
      grid gap-3
      grid-cols-2
      sm:grid-cols-3
      lg:grid-cols-4
      xl:grid-cols-5
    ">
      {tracks.map((t) => (
        <TrackCard key={t.id} track={t} queue={queue} />
      ))}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export function HomeContent() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { play } = usePlayer();

  const [tracks,      setTracks]      = useState<Track[]>([]);
  const [isEmpty,     setIsEmpty]     = useState(false);
  const [seeding,     setSeeding]     = useState(false);
  const [seedResult,  setSeedResult]  = useState<string | null>(null);
  const [mostPlayed,  setMostPlayed]  = useState<Track[]>([]);
  const [recommended, setRecommended] = useState<{ track: Track; reason: string }[]>([]);
  const [dailyMixes,  setDailyMixes]  = useState<Playlist[]>([]);

  useEffect(() => {
    api.get<{ data: Track[] }>("/tracks")
      .then((res) => {
        const t = unwrapData(res);
        setTracks(t);
        setIsEmpty(t.length === 0);
        setMostPlayed([...t].sort((a, b) => b.playCount - a.playCount).slice(0, 5));
      })
      .catch(() => setIsEmpty(true));

    api.get<{ data: Track[] }>("/tracks/recommendations", { params: { limit: 5 } })
      .then((res) => {
        const rec = unwrapData(res);
        setRecommended(rec.map((track) => ({
          track,
          reason: track.genre ? `Because you like ${track.genre}`
            : track.artist ? `More from ${track.artist}` : "Picked for you",
        })));
      })
      .catch(() => {});

    if (isAuthenticated) {
      api.get<{ data: Playlist[] }>("/playlists/daily-mixes")
        .then((res) => setDailyMixes(unwrapData(res)))
        .catch(() => {});
    }
  }, [isAuthenticated]);

  async function handleSeed() {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await api.post<{ data: { imported: number; skipped: number } }>("/admin/seed");
      const { imported, skipped } = res.data.data ?? res.data;
      setSeedResult(`Added ${imported} tracks${skipped ? ` (${skipped} already existed)` : ""}.`);
      const t = unwrapData(await api.get<{ data: Track[] }>("/tracks"));
      setTracks(t);
      setIsEmpty(t.length === 0);
      setMostPlayed([...t].sort((a, b) => b.playCount - a.playCount).slice(0, 5));
    } catch {
      setSeedResult("Seed failed — check the server logs.");
    } finally {
      setSeeding(false);
    }
  }

  const featuredTrack = tracks[0] ?? null;

  return (
    <div className="space-y-10 px-5 pb-32 pt-5 md:px-8">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl border border-white/[0.07] p-7 md:p-10"
        style={{ background: "linear-gradient(135deg, rgba(109,40,217,0.25) 0%, rgba(79,70,229,0.12) 50%, rgba(7,7,15,0) 100%)" }}
      >
        {/* Orbs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-violet/[0.15] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-amber/[0.08] blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet/50 to-transparent" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-lg">
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-violet/25 bg-violet/[0.08] px-3 py-1 text-xs font-semibold text-violet">
              <Sparkles size={10} /> Your music space
            </span>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-zinc-50 md:text-4xl">
              Upload, discover &<br />
              <span className="bg-gradient-to-r from-violet-300 via-violet to-amber bg-clip-text text-transparent">
                own your sound.
              </span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Stream royalty-free tracks, build playlists, and share with people who get it.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/discover"
                className="
                  flex items-center gap-2 rounded-full
                  bg-gradient-to-r from-accent to-violet-500
                  px-5 py-2.5 text-sm font-semibold text-white
                  shadow-[0_0_20px_rgba(124,58,237,0.4)]
                  hover:shadow-[0_0_28px_rgba(124,58,237,0.55)]
                  hover:opacity-95 transition-all
                "
              >
                <Music2 size={14} /> Explore
              </Link>
              <Link
                href="/upload"
                className="
                  flex items-center gap-2 rounded-full
                  border border-white/[0.1] bg-white/[0.05]
                  px-5 py-2.5 text-sm font-medium text-zinc-300
                  hover:bg-white/[0.09] hover:text-white transition-colors
                "
              >
                Upload a track
              </Link>
            </div>
          </div>

          {/* Featured track quick-play */}
          {featuredTrack && (
            <div className="
              flex shrink-0 items-center gap-4 rounded-2xl
              border border-white/[0.08] bg-white/[0.04]
              px-4 py-3 md:w-64
            ">
              <div
                className="h-12 w-12 shrink-0 rounded-xl flex items-center justify-center text-xl font-black text-white/20"
                style={{ background: "linear-gradient(135deg,#6d28d9,#4338ca)" }}
              >
                {featuredTrack.title.slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-zinc-200">{featuredTrack.title}</p>
                <p className="truncate text-[11px] text-zinc-500">{featuredTrack.artist}</p>
              </div>
              <button
                onClick={() => play(featuredTrack, tracks)}
                className="
                  grid h-9 w-9 shrink-0 place-items-center rounded-full
                  bg-gradient-to-br from-violet-400 to-accent
                  text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]
                  hover:scale-105 active:scale-95 transition-transform
                "
                aria-label={`Play ${featuredTrack.title}`}
              >
                <Play size={16} fill="currentColor" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Empty / Seed state ─────────────────────────────────────────────── */}
      {isEmpty && (
        <section className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-white/[0.08] bg-white/[0.015] py-16 text-center">
          <div className="grid h-16 w-16 animate-float place-items-center rounded-2xl bg-accent/[0.12] text-violet">
            <Library size={30} />
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-200">Library is empty</h2>
            <p className="mt-1 max-w-xs text-sm text-zinc-600">
              Seed it with 10 royalty-free Creative Commons tracks to get started instantly.
            </p>
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="
              rounded-full bg-gradient-to-r from-accent to-violet-500
              px-7 py-2.5 text-sm font-semibold text-white
              shadow-[0_0_20px_rgba(124,58,237,0.4)]
              hover:opacity-90 transition-opacity
              disabled:opacity-40 disabled:cursor-not-allowed
            "
          >
            {seeding ? "Importing…" : "Seed Library"}
          </button>
          {seedResult && <p className="text-xs text-zinc-500">{seedResult}</p>}
        </section>
      )}

      {/* ── Daily Mixes ────────────────────────────────────────────────────── */}
      {dailyMixes.length > 0 && (
        <section>
          <SectionHeader label="Your Daily Mixes" sub="Personalised playlists refreshed for you" href="/playlist" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {dailyMixes.map((mix) => (
              <Link
                key={mix.id}
                href={`/playlist/${mix.id}`}
                className="
                  group flex items-center gap-4 rounded-2xl
                  border border-white/[0.06] bg-white/[0.025]
                  p-4 transition-all duration-200
                  hover:bg-white/[0.05] hover:border-white/[0.1]
                  hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                "
              >
                <div className="
                  grid h-12 w-12 shrink-0 place-items-center rounded-xl
                  bg-gradient-to-br from-accent/25 to-violet/15 text-violet
                ">
                  <PlayCircle size={22} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-100">{mix.name}</p>
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{mix.description}</p>
                </div>
                <ArrowRight size={14} className="ml-auto shrink-0 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Recently Uploaded ──────────────────────────────────────────────── */}
      {tracks.length > 0 && (
        <section>
          <SectionHeader label="Recently Uploaded" sub="Fresh tracks from the community" href="/discover" />
          <TrackRow tracks={tracks.slice(0, 10)} queue={tracks} />
        </section>
      )}

      {/* ── Most Played ────────────────────────────────────────────────────── */}
      {mostPlayed.length > 0 && (
        <section>
          <SectionHeader label="Most Played" />
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {mostPlayed.map((track, i) => (
              <div key={track.id} className="relative">
                <TrackCard track={track} queue={mostPlayed} />
                {/* Big ranking number */}
                <span className="pointer-events-none absolute left-4 top-2 select-none text-6xl font-black leading-none text-black/30">
                  {i + 1}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Recommended ────────────────────────────────────────────────────── */}
      {recommended.length > 0 && (
        <section>
          <SectionHeader label="Recommended for You" sub="Based on your listening history" />
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {recommended.map(({ track, reason }) => (
              <div key={track.id} className="flex flex-col gap-1.5">
                <TrackCard track={track} queue={recommended.map((r) => r.track)} />
                <p className="flex items-center gap-1 px-1 text-[11px] text-zinc-700">
                  <TrendingUp size={10} className="shrink-0" /> {reason}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Browse Genres ──────────────────────────────────────────────────── */}
      <section>
        <SectionHeader label="Browse Genres" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {GENRES.map(({ name, icon, bg, accent }) => (
            <Link
              key={name}
              href={`/search?genre=${encodeURIComponent(name)}`}
              className={`
                group relative overflow-hidden rounded-2xl
                border border-white/[0.06]
                bg-gradient-to-br ${bg}
                px-4 py-5
                transition-all duration-200
                hover:-translate-y-0.5 hover:border-white/[0.12]
                hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)]
              `}
            >
              {/* Glow dot */}
              <div
                className="pointer-events-none absolute -right-3 -top-3 h-12 w-12 rounded-full opacity-40 blur-xl transition-opacity group-hover:opacity-70"
                style={{ backgroundColor: accent }}
              />
              <span className="mb-2 block text-2xl">{icon}</span>
              <p className="text-sm font-semibold text-zinc-200">{name}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
