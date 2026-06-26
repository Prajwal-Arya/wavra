"use client";

interface ProgressBarProps {
  progress: number;
  onSeek: (value: number) => void;
}

export function ProgressBar({ progress, onSeek }: ProgressBarProps) {
  return (
    <div className="group relative flex flex-1 items-center">
      {/* Coloured fill track */}
      <div
        className="pointer-events-none absolute left-0 h-[3px] rounded-full bg-gradient-to-r from-accent to-violet transition-all duration-150"
        style={{ width: `${progress}%` }}
      />
      {/* Playhead dot */}
      <div
        className="pointer-events-none absolute h-3 w-3 -translate-x-1/2 rounded-full bg-white shadow-glow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ left: `${progress}%` }}
      />
      <input
        aria-label="Seek"
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={progress}
        onChange={(e) => onSeek(Number(e.target.value))}
        className="w-full opacity-0 absolute inset-0 cursor-pointer h-full"
      />
      {/* Visual track background */}
      <div className="h-[3px] w-full rounded-full bg-white/[0.08]" />
    </div>
  );
}
