"use client";

import { useState } from "react";
import { MoodFeed } from "@/components/discover/MoodFeed";
import { MoodSelector } from "@/components/discover/MoodSelector";
import { moodColors, type Mood } from "@/lib/moods";

export function DiscoverClient() {
  const [selectedMood, setSelectedMood] = useState<Mood>("chill");
  const colors = moodColors[selectedMood];

  return (
    <div className="space-y-8 p-4 md:p-8">
      <section className="glass-card relative overflow-hidden rounded-md p-6">
        <div className="absolute inset-0 -z-10 opacity-20" style={{ background: `linear-gradient(135deg, ${colors.from}, ${colors.to})` }} />
        <p className="text-sm font-semibold text-accent">Mood discovery</p>
        <h1 className="mt-2 text-3xl font-bold">Pick a feeling. Find the sound.</h1>
      </section>
      <section className="glass-card rounded-md p-5">
        <MoodSelector selectedMood={selectedMood} onSelect={setSelectedMood} />
      </section>
      <section>
        <h2 className="mb-4 text-xl font-bold capitalize">{selectedMood} tracks</h2>
        <MoodFeed mood={selectedMood} />
      </section>
    </div>
  );
}
