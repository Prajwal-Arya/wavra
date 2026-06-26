"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePlayer } from "@/hooks/usePlayer";

const presets: Record<string, number[]> = {
  Flat:           [0,  0,  0,  0,  0],
  "Bass Boost":   [6,  4,  1,  0,  0],
  "Treble Boost": [0,  0,  1,  4,  6],
  Vocal:          [-1, 1,  4,  2,  0],
  Night:          [-4, -2, 0,  1,  1],
};
const bands = ["60Hz", "250Hz", "1kHz", "4kHz", "12kHz"];

export function Equalizer() {
  const setEqualizer = usePlayer((state) => state.setEqualizer);
  const [values, setValues] = useState(presets.Flat);
  const [open, setOpen]     = useState(false);
  const [active, setActive] = useState("Flat");
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

  function update(next: number[], presetName?: string) {
    setValues(next);
    setEqualizer(next);
    if (presetName) setActive(presetName);
  }

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        aria-label="Equalizer"
        className={`
          grid h-8 w-8 place-items-center rounded-full transition-colors
          ${open ? "bg-accent/20 text-violet" : "text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200"}
        `}
      >
        <SlidersHorizontal size={16} />
      </button>

      {mounted && open && createPortal(
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setOpen(false)} />
          <div
            className="
              fixed z-[101] w-72
              rounded-2xl border border-white/[0.08]
              bg-[#0c0c1a] p-4
              shadow-[0_16px_48px_rgba(0,0,0,0.7)]
            "
            style={{ bottom: pos.bottom, left: pos.left, transform: "translateX(-50%)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-zinc-100">Equalizer</p>
              <button
                onClick={() => setOpen(false)}
                className="grid h-7 w-7 place-items-center rounded-full text-zinc-500 hover:bg-white/[0.07] hover:text-zinc-200 transition-colors"
              >
                <X size={13} />
              </button>
            </div>

            {/* Preset pills */}
            <div className="mb-4 flex flex-wrap gap-1.5">
              {Object.entries(presets).map(([name, preset]) => (
                <button
                  key={name}
                  onClick={() => update(preset, name)}
                  className={`
                    rounded-full px-3 py-1 text-[11px] font-medium transition-all
                    ${active === name
                      ? "bg-accent/20 text-violet border border-accent/40"
                      : "border border-white/[0.07] bg-white/[0.04] text-zinc-400 hover:bg-white/[0.08] hover:text-zinc-200"
                    }
                  `}
                >
                  {name}
                </button>
              ))}
            </div>

            {/* Band sliders */}
            <div className="flex items-end justify-between gap-1 px-1">
              {values.map((value, i) => (
                <label key={i} className="flex flex-col items-center gap-1.5">
                  <span className={`text-[10px] font-semibold tabular-nums ${value > 0 ? "text-violet" : value < 0 ? "text-amber" : "text-zinc-700"}`}>
                    {value > 0 ? `+${value}` : value}
                  </span>
                  <div className="relative flex h-24 w-6 items-center justify-center">
                    <div className="absolute inset-x-0 top-1/2 h-px bg-white/[0.08]" />
                    <input
                      type="range" min={-8} max={8} step={1} value={value}
                      aria-label={bands[i]}
                      style={{ writingMode: "vertical-lr", direction: "rtl", WebkitAppearance: "slider-vertical" } as React.CSSProperties}
                      className="h-24 w-5 cursor-pointer"
                      onChange={(e) => update(values.map((v, j) => j === i ? Number(e.target.value) : v))}
                    />
                  </div>
                  <span className="text-[10px] text-zinc-600">{bands[i]}</span>
                </label>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
