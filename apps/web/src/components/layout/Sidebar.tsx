"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3, Compass, Headphones, Home, Library,
  Link as LinkIcon, Music2, Search, Trophy, Upload, Users, Zap,
} from "lucide-react";

const nav = [
  { href: "/",             label: "Home",      icon: Home },
  { href: "/discover",     label: "Discover",  icon: Compass },
  { href: "/search",       label: "Search",    icon: Search },
  { href: "/upload",       label: "Upload",    icon: Upload },
  { href: "/import",       label: "Import",    icon: LinkIcon },
  { href: "/feed",         label: "Feed",      icon: Users },
  { href: "/leaderboards", label: "Leaders",   icon: Trophy },
  { href: "/analytics",    label: "Analytics", icon: Zap },
  { href: "/stats",        label: "Stats",     icon: BarChart3 },
  { href: "/playlist",     label: "Library",   icon: Library },
];

const playlists = [
  { name: "Favourites", color: "#a78bfa" },
  { name: "Late Focus",  color: "#f59e0b" },
  { name: "Drive",       color: "#34d399" },
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside
      style={{ position: "fixed", top: 0, left: 0, bottom: "5rem", zIndex: 40 }}
      className="
        group/sidebar
        hidden md:flex flex-col
        w-[68px] hover:w-56
        overflow-hidden
        transition-[width] duration-300 ease-in-out
        border-r border-white/[0.06]
        bg-[#07070f]/90 backdrop-blur-2xl
      "
    >
      {/* ── Logo ───────────────────────────────────────── */}
      <Link
        href="/"
        className="flex h-14 shrink-0 items-center gap-3 px-4"
      >
        <span className="
          grid h-9 w-9 shrink-0 place-items-center rounded-xl
          bg-gradient-to-br from-violet-400 to-accent
          text-white shadow-[0_0_14px_rgba(124,58,237,0.5)]
          transition-transform duration-200 group-hover/sidebar:scale-95
        ">
          <Headphones size={18} />
        </span>
        <span className="
          whitespace-nowrap font-bold tracking-tight text-zinc-100
          opacity-0 transition-all duration-200 delay-75
          group-hover/sidebar:opacity-100
        ">
          Wavra
        </span>
      </Link>

      <div className="mx-3 h-px bg-white/[0.06]" />

      {/* ── Nav ────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? path === "/" : (path ?? "").startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={label}
              className={`
                relative flex items-center gap-3 rounded-xl
                px-3 py-2.5 text-sm
                transition-all duration-150
                ${active
                  ? "bg-accent/[0.12] text-violet"
                  : "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
                }
              `}
            >
              {/* Active indicator bar */}
              {active && (
                <span
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-accent"
                  style={{ boxShadow: "0 0 8px rgba(124,58,237,0.8)" }}
                />
              )}
              <Icon
                size={18}
                className={`shrink-0 transition-transform duration-150 ${active ? "scale-110" : "group-hover/sidebar:scale-100"}`}
              />
              <span className="
                whitespace-nowrap text-sm font-medium
                opacity-0 transition-all duration-200 delay-50
                group-hover/sidebar:opacity-100
              ">
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 h-px bg-white/[0.06]" />

      {/* ── Playlists ──────────────────────────────────── */}
      <div className="px-2 py-3 space-y-0.5 overflow-hidden">
        <p className="
          mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-700
          whitespace-nowrap opacity-0 transition-all duration-200 delay-75
          group-hover/sidebar:opacity-100
        ">
          Playlists
        </p>
        {playlists.map(({ name, color }) => (
          <Link
            key={name}
            href="/playlist"
            title={name}
            className="
              flex items-center gap-3 rounded-xl px-3 py-2
              text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200
              transition-colors duration-150
            "
          >
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
            />
            <span className="
              whitespace-nowrap text-xs font-medium
              opacity-0 transition-all duration-200 delay-75
              group-hover/sidebar:opacity-100
            ">
              {name}
            </span>
          </Link>
        ))}

        {/* New playlist hint — only visible when expanded */}
        <Link
          href="/playlist"
          title="New playlist"
          className="
            flex items-center gap-3 rounded-xl px-3 py-2
            text-zinc-700 hover:text-zinc-400 transition-colors
          "
        >
          <Music2 size={14} className="shrink-0" />
          <span className="
            whitespace-nowrap text-xs
            opacity-0 transition-all duration-200 delay-75
            group-hover/sidebar:opacity-100
          ">
            New playlist
          </span>
        </Link>
      </div>
    </aside>
  );
}
