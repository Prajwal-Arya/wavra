"use client";

import { usePlayer } from "@/hooks/usePlayer";
import { moodColors } from "@/lib/moods";

export function AmbientBackground() {
  const currentTrack = usePlayer((state) => state.currentTrack);
  const mood = currentTrack?.mood && currentTrack.mood in moodColors ? currentTrack.mood : "dreamy";
  const colors = moodColors[mood as keyof typeof moodColors];

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-page">
      <div
        className="absolute -left-1/4 -top-1/4 h-[70vh] w-[70vw] animate-ambient-drift rounded-full opacity-30 blur-[90px]"
        style={{ background: `radial-gradient(circle, ${colors.from}, transparent 62%)` }}
      />
      <div
        className="absolute -bottom-1/3 right-[-12%] h-[78vh] w-[58vw] animate-ambient-drift rounded-full opacity-25 blur-[110px]"
        style={{ background: `radial-gradient(circle, ${colors.to}, transparent 64%)`, animationDelay: "-6s" }}
      />
      <div className="absolute inset-0 bg-[#07070f]/70" />
    </div>
  );
}
