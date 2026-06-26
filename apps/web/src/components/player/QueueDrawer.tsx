"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ListMusic, Play, Trash2, X } from "lucide-react";
import { usePlayer } from "@/hooks/usePlayer";

function QueuePanel({ onClose }: { onClose: () => void }) {
  const player = usePlayer();
  const ref = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={ref}
        className="
          fixed right-0 top-0 bottom-0 z-[101]
          flex w-full max-w-sm flex-col
          border-l border-white/[0.08]
          bg-[#0c0c1a] shadow-[−12px_0_60px_rgba(0,0,0,0.7)]
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-100">Up Next</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {player.queue.length
                ? `${player.queue.length} track${player.queue.length === 1 ? "" : "s"}`
                : "Queue is empty"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {player.queue.length > 0 && (
              <button
                onClick={player.clearQueue}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-zinc-500 hover:bg-white/[0.05] hover:text-red-400 transition-colors"
              >
                <Trash2 size={11} /> Clear
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close queue"
              className="grid h-8 w-8 place-items-center rounded-full text-zinc-500 hover:bg-white/[0.07] hover:text-zinc-200 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Track list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {player.queue.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-center">
              <ListMusic size={36} className="text-zinc-800" />
              <p className="text-sm text-zinc-600">Play a track to start the queue.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {player.queue.map((track, index) => {
                const active = index === player.queueIndex;
                return (
                  <div
                    key={`${track.id}-${index}`}
                    className={`
                      group flex items-center gap-3 rounded-xl p-3
                      transition-all duration-150 cursor-default
                      ${active
                        ? "bg-accent/[0.12] border border-accent/25"
                        : "border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]"
                      }
                    `}
                  >
                    {/* Play / index button */}
                    <button
                      onClick={() => player.playQueueIndex(index)}
                      aria-label={`Play ${track.title}`}
                      className={`
                        relative grid h-9 w-9 shrink-0 place-items-center rounded-xl
                        text-xs font-bold transition-all duration-150
                        ${active
                          ? "bg-gradient-to-br from-violet-400 to-accent text-white shadow-[0_0_12px_rgba(124,58,237,0.4)]"
                          : "bg-white/[0.06] text-zinc-500 group-hover:bg-accent/15 group-hover:text-violet"
                        }
                      `}
                    >
                      {active
                        ? <Play size={14} fill="currentColor" />
                        : <span className="group-hover:hidden">{index + 1}</span>
                      }
                      {!active && (
                        <Play size={13} fill="currentColor" className="hidden group-hover:block text-violet" />
                      )}
                    </button>

                    {/* Track info */}
                    <div className="min-w-0 flex-1">
                      <p className={`truncate text-sm font-medium leading-tight ${active ? "text-violet" : "text-zinc-200"}`}>
                        {track.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-zinc-600">{track.artist}</p>
                    </div>

                    {/* Duration */}
                    {track.durationSeconds != null && (
                      <span className="shrink-0 text-[11px] tabular-nums text-zinc-700 group-hover:hidden">
                        {Math.floor(track.durationSeconds / 60)}:{String(Math.floor(track.durationSeconds % 60)).padStart(2, "0")}
                      </span>
                    )}

                    {/* Remove */}
                    <button
                      onClick={() => player.removeFromQueue(index)}
                      aria-label={`Remove ${track.title}`}
                      className="hidden group-hover:grid h-7 w-7 place-items-center rounded-lg text-zinc-600 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

export function QueueDrawer() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure we only portal on the client
  useEffect(() => setMounted(true), []);

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open queue"
        className={`
          grid h-8 w-8 place-items-center rounded-full transition-colors
          ${open
            ? "bg-accent/20 text-violet"
            : "text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200"
          }
        `}
      >
        <ListMusic size={16} />
      </button>

      {mounted && open && <QueuePanel onClose={() => setOpen(false)} />}
    </>
  );
}
