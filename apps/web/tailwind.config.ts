import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        page:    "#07070f",
        panel:   "#0e0e1c",
        surface: "#15152a",
        border:  "rgba(255,255,255,0.07)",
        accent:  "#7c3aed",
        violet:  "#a78bfa",
        amber:   "#f59e0b",
        muted:   "#6b7280"
      },
      boxShadow: {
        glow:     "0 0 20px rgba(124,58,237,0.45), 0 0 60px rgba(124,58,237,0.15)",
        "glow-sm":"0 0 10px rgba(124,58,237,0.5)",
        "glow-amber": "0 0 20px rgba(245,158,11,0.35)"
      },
      fontFamily: {
        sans: ["'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["'Cal Sans'", "'Inter'", "ui-sans-serif", "sans-serif"]
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "pulse-glow": {
          "0%,100%": { boxShadow: "0 0 8px rgba(124,58,237,0.4)" },
          "50%": { boxShadow: "0 0 22px rgba(124,58,237,0.75)" }
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" }
        }
      },
      animation: {
        "fade-up":    "fade-up 0.4s ease both",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "shimmer":    "shimmer 2s linear infinite"
      }
    }
  },
  plugins: []
};

export default config;
