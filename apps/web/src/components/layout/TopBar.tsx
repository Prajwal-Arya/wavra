"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogOut, Search, Settings, User, X } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

const PAGE_TITLES: Record<string, string> = {
  "/":             "Home",
  "/discover":     "Discover",
  "/search":       "Search",
  "/upload":       "Upload",
  "/import":       "Import",
  "/feed":         "Feed",
  "/leaderboards": "Leaderboards",
  "/analytics":    "Analytics",
  "/stats":        "Stats",
  "/playlist":     "Library",
};

export function TopBar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, loadMe, logout } = useAuthStore();

  const [query,    setQuery]    = useState("");
  const [focused,  setFocused]  = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pageTitle = PAGE_TITLES[pathname] ?? "";
  const initial   = (user?.displayName || user?.username || "?").slice(0, 1).toUpperCase();

  useEffect(() => {
    if (!isAuthenticated) void loadMe().catch(() => undefined);
  }, [isAuthenticated, loadMe]);

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, []);

  // Keyboard shortcut: "/" focuses search
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function submitSearch(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = query.trim();
    if (value) router.push(`/search?q=${encodeURIComponent(value)}`);
    inputRef.current?.blur();
  }

  function clearSearch() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <header className="
      sticky top-0 z-20
      flex h-14 items-center gap-4
      border-b border-white/[0.05]
      bg-[#07070f]/75 backdrop-blur-3xl
      px-4 md:px-6
    ">
      {/* Page title — hidden when search is focused */}
      {pageTitle && !focused && (
        <h1 className="hidden shrink-0 text-sm font-semibold text-zinc-300 md:block">
          {pageTitle}
        </h1>
      )}

      {/* Search */}
      <form
        onSubmit={submitSearch}
        className={`relative transition-all duration-300 ${focused ? "flex-1 max-w-xl" : "w-56 max-w-xs"}`}
      >
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 transition-colors"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={focused ? "Search tracks, artists, playlists…" : "Search  /"}
          className="
            h-9 w-full rounded-full
            border border-white/[0.07] bg-white/[0.04]
            pl-8 pr-8 text-sm text-zinc-300
            placeholder:text-zinc-600
            focus:border-violet/40 focus:bg-white/[0.07] focus:outline-none
            transition-all duration-200
          "
        />
        {/* Clear button */}
        {query && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); clearSearch(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-5 w-5 place-items-center rounded-full text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <X size={12} />
          </button>
        )}
        {/* Keyboard hint when not focused and empty */}
        {!focused && !query && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-white/[0.08] px-1 py-0.5 text-[10px] text-zinc-600">
            /
          </span>
        )}
      </form>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-1.5">
        {/* Notifications */}
        {isAuthenticated && (
          <button
            aria-label="Notifications"
            className="relative grid h-8 w-8 place-items-center rounded-full text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200 transition-colors"
          >
            <Bell size={15} />
            {/* Unread dot */}
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </button>
        )}

        {isAuthenticated ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className={`
                flex h-8 items-center gap-2 rounded-full px-2 pr-3
                border transition-all duration-150
                ${menuOpen
                  ? "border-violet/40 bg-accent/10 text-violet"
                  : "border-white/[0.07] bg-white/[0.04] text-zinc-300 hover:bg-white/[0.07] hover:text-white"
                }
              `}
            >
              {/* Avatar */}
              <span className="
                grid h-5 w-5 place-items-center rounded-full
                bg-gradient-to-br from-violet-400 to-accent
                text-[10px] font-bold text-white shrink-0
              ">
                {initial}
              </span>
              <span className="hidden max-w-[6rem] truncate text-xs font-medium sm:inline">
                {user?.displayName || user?.username || "Account"}
              </span>
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="
                absolute right-0 top-[calc(100%+6px)] z-50 w-52
                rounded-2xl border border-white/[0.08]
                bg-[#0c0c1a]
                shadow-[0_16px_48px_rgba(0,0,0,0.7)]
                overflow-hidden
              ">
                {/* User info header */}
                <div className="border-b border-white/[0.06] px-4 py-3">
                  <p className="text-xs font-semibold text-zinc-200">
                    {user?.displayName || user?.username}
                  </p>
                  <p className="mt-0.5 truncate text-[11px] text-zinc-600">{user?.email}</p>
                </div>

                <div className="p-1">
                  <Link
                    href={user?.id ? `/profile/${user.id}` : "/profile/me"}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                  >
                    <User size={14} className="text-zinc-500" />
                    View Profile
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-zinc-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                  >
                    <Settings size={14} className="text-zinc-500" />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-white/[0.06] p-1">
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-zinc-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-1.5 text-xs font-medium text-zinc-300 hover:bg-white/[0.08] hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-accent to-violet-500 px-4 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
