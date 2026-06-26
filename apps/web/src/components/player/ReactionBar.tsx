"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { usePlayer } from "@/hooks/usePlayer";
import { useAuthStore } from "@/stores/authStore";

const REACTIONS = [
  { emoji: "🔥", label: "Fire" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😂", label: "Lol" },
  { emoji: "🌙", label: "Dreamy" },
];

export function ReactionBar() {
  const player          = usePlayer();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [open, setOpen]       = useState(false);
  const [flash, setFlash]     = useState<string | null>(null);
  const [lastReact, setLast]  = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ bottom: 0, left: 0 });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setFlash(null);
    setLast(null);
  }, [player.currentTrack]);

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ bottom: window.innerHeight - r.top + 8, left: r.left + r.width / 2 });
    }
  }, [open]);

  async function react(emoji: string) {
    if (!player.currentTrack) return;
    if (!isAuthenticated) { setFlash("Sign in"); setTimeout(() => setFlash(null), 1200); return; }
    const timestamp = Math.round((player.progress / 100) * player.duration);
    try {
      await api.post(`/tracks/${player.currentTrack.id}/reactions`, { emoji, timestamp });
      setLast(emoji);
      setFlash(emoji);
      setTimeout(() => setFlash(null), 900);
    } catch {
      setFlash("✕");
      setTimeout(() => setFlash(null), 1000);
    }
    setOpen(false);
  }

  if (!player.currentTrack) return null;

  return (
    <div className="relative hidden lg:block">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="React to track"
        className={`
          grid h-8 w-8 place-items-center rounded-full text-sm
          transition-all duration-150
          ${open ? "bg-accent/20 scale-110" : "text-zinc-400 hover:bg-white/[0.07] hover:scale-110"}
        `}
      >
        {flash
          ? <span className="animate-bounce text-base">{flash}</span>
          : <span className={lastReact ? "text-base" : "text-[13px] text-zinc-500"}>
              {lastReact ?? "✦"}
            </span>
        }
      </button>

      {mounted && open && createPortal(
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div
            className="
              fixed z-[101] flex items-center gap-1
              rounded-full border border-white/[0.08]
              bg-[#0c0c1a] p-1.5
              shadow-[0_8px_32px_rgba(0,0,0,0.6)]
            "
            style={{ bottom: pos.bottom, left: pos.left, transform: "translateX(-50%)" }}
          >
            {REACTIONS.map(({ emoji, label }) => (
              <button
                key={emoji}
                aria-label={label}
                onClick={() => void react(emoji)}
                className="grid h-9 w-9 place-items-center rounded-full text-lg transition-all hover:bg-white/[0.08] hover:scale-125 active:scale-95"
              >
                {emoji}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
