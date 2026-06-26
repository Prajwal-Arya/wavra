"use client";

import { useEffect } from "react";
import { usePlayer } from "@/hooks/usePlayer";

export function useKeyboardShortcuts() {
  const player = usePlayer();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable) return;

      if (event.code === "Space") {
        event.preventDefault();
        player.isPlaying ? player.pause() : player.resume();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("wavra:seek-seconds", { detail: -5 }));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent("wavra:seek-seconds", { detail: 5 }));
      }
      if (event.key.toLowerCase() === "n") player.next();
      if (event.key.toLowerCase() === "p") player.prev();
      if (event.key.toLowerCase() === "m") player.toggleMute();
      if (event.key.toLowerCase() === "s") player.toggleShuffle();
      if (event.key.toLowerCase() === "r") player.toggleRepeat();
      if (event.key.toLowerCase() === "v") player.toggleTurntableMode();
      if (event.key === "ArrowUp") player.setVolume(Math.min(1, player.volume + 0.05));
      if (event.key === "ArrowDown") player.setVolume(Math.max(0, player.volume - 0.05));
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [player]);
}
