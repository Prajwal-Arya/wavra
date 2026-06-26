export const moodColors = {
  chill: { from: "#3B82F6", to: "#14B8A6" },
  hype: { from: "#EF4444", to: "#F97316" },
  sad: { from: "#6366F1", to: "#6B7280" },
  focus: { from: "#10B981", to: "#059669" },
  romantic: { from: "#EC4899", to: "#F43F5E" },
  angry: { from: "#DC2626", to: "#7C2D12" },
  happy: { from: "#FBBF24", to: "#F59E0B" },
  dreamy: { from: "#8B5CF6", to: "#A78BFA" }
} as const;

export type Mood = keyof typeof moodColors;

export const moods = Object.keys(moodColors) as Mood[];
