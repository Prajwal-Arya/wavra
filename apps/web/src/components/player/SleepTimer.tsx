"use client";

import { Moon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePlayer } from "@/hooks/usePlayer";

const PRESETS = [15, 30, 45, 60, 90];

export function SleepTimer() {
  const sleepTimerEnd  = usePlayer((state) => state.sleepTimerEnd);
  const setSleepTimer  = usePlayer((state) => state.setSleepTimer);
  const [open, setOpen]     = useState(false);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ bottom: 0, left: 0 });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ bottom: window.innerHeight - r.top + 8, left: r.left + r.width / 2 });
    }
  }, [open]);

  const remaining = sleepTimerEnd
    ? Math.max(0, Math.ceil((sleepTimerEnd - Date.now()) / 60_000))
    : null;
  const active = remaining !== null;

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Sleep timer"
        className={`
          relative grid h-8 w-8 place-items-center rounded-full transition-colors
          ${active ? "text-amber" : open ? "bg-white/[0.07] text-zinc-200" : "text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200"}
        `}
      >
        <Moon size={15} />
        {active && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber text-[8px] font-bold text-black leading-none">
            {remaining}
          </span>
        )}
      </button>

      {mounted && open && createPortal(
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div
            className="
              fixed z-[101] w-44
              rounded-2xl border border-white/[0.08]
              bg-[#0c0c1a] p-3
              shadow-[0_16px_48px_rgba(0,0,0,0.7)]
            "
            style={{ bottom: pos.bottom, left: pos.left, transform: "translateX(-50%)" }}
          >
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold text-zinc-300">
                {active ? `${remaining} min left` : "Sleep timer"}
              </p>
              <button
                onClick={() => setOpen(false)}
                className="grid h-6 w-6 place-items-center rounded-full text-zinc-600 hover:bg-white/[0.07] hover:text-zinc-300 transition-colors"
              >
                <X size={12} />
              </button>
            </div>

            <div className="space-y-0.5">
              {PRESETS.map((min) => (
                <button
                  key={min}
                  onClick={() => { setSleepTimer(min); setOpen(false); }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100 transition-colors"
                >
                  {min} minutes
                </button>
              ))}
              {active && (
                <button
                  onClick={() => { setSleepTimer(null); setOpen(false); }}
                  className="w-full rounded-lg px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  Cancel timer
                </button>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
