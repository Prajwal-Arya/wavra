"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Pause, Play, SkipForward, X } from "lucide-react";
import { getApiBaseUrl } from "@/lib/api";
import { usePlayer } from "@/hooks/usePlayer";

interface Position { x: number; y: number }

export function MiniPlayer() {
  const player = usePlayer();
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<Position>({ x: 24, y: 24 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  // Show mini player when a track is playing and user scrolls past PlayerBar
  useEffect(() => {
    const onScroll = () => setVisible(Boolean(player.currentTrack) && window.scrollY > 120);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [player.currentTrack]);

  useEffect(() => {
    if (!player.currentTrack) setVisible(false);
  }, [player.currentTrack]);

  const onMouseDown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setDragging(true);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      setPos({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [dragging]);

  if (!visible || !player.currentTrack) return null;

  const track = player.currentTrack;
  const base = getApiBaseUrl().replace(/\/api$/, "");
  const coverUrl = track.coverPath ? `${base}/uploads/covers/${track.coverPath.split("/").pop()}` : null;

  return (
    <div
      ref={ref}
      style={{ position: "fixed", left: pos.x, top: pos.y, zIndex: 50, cursor: dragging ? "grabbing" : "grab", userSelect: "none" }}
      className="glass-card flex w-64 items-center gap-3 rounded-xl p-3 shadow-2xl"
      onMouseDown={onMouseDown}
    >
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-surface">
        {coverUrl
          ? <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          : <div className="flex h-full w-full items-center justify-center text-lg">🎵</div>
        }
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold">{track.title}</p>
        <p className="truncate text-[10px] text-zinc-400">{track.artist}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/10"
          aria-label={player.isPlaying ? "Pause" : "Play"}
          onClick={player.isPlaying ? player.pause : player.resume}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {player.isPlaying ? <Pause size={14} /> : <Play size={14} />}
        </button>
        <button
          className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/10"
          aria-label="Next"
          onClick={player.next}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <SkipForward size={14} />
        </button>
        <button
          className="grid h-7 w-7 place-items-center rounded-full hover:bg-white/10"
          aria-label="Close mini player"
          onClick={() => setVisible(false)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X size={14} />
        </button>
      </div>
      <button
        className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-surface text-zinc-500 hover:text-white"
        title="Minimise"
        onClick={() => setVisible(false)}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Minus size={10} />
      </button>
    </div>
  );
}
