"use client";

import { moodColors, moods, type Mood } from "@/lib/moods";

export function MoodSelector({ selectedMood, onSelect }: { selectedMood: Mood; onSelect: (mood: Mood) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      {moods.map((mood) => {
        const colors = moodColors[mood];
        const selected = mood === selectedMood;
        return (
          <button
            key={mood}
            className={`flex items-center gap-3 rounded-md border p-3 text-left transition ${selected ? "border-white/40 bg-white/15" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
            onClick={() => onSelect(mood)}
          >
            <span className="h-6 w-6 rounded-full shadow-lg" style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }} />
            <span className="text-sm font-semibold capitalize">{mood}</span>
          </button>
        );
      })}
    </div>
  );
}
