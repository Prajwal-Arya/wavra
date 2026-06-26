export interface LyricLine {
  time: number;
  text: string;
}

export function parseLrc(input: string): LyricLine[] {
  return input
    .split("\n")
    .flatMap((line) => {
      const matches = [...line.matchAll(/\[(\d{1,2}):(\d{2})(?:\.(\d{1,2}))?\]/g)];
      const text = line.replace(/\[[^\]]+\]/g, "").trim();
      return matches.map((match) => ({
        time: Number(match[1]) * 60 + Number(match[2]) + Number(`0.${match[3] ?? "0"}`),
        text
      }));
    })
    .filter((line) => line.text)
    .sort((a, b) => a.time - b.time);
}
