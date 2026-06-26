export function Tonearm({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className={`absolute right-8 top-6 h-48 w-28 origin-top-right transition-transform duration-500 ${isPlaying ? "rotate-[24deg]" : "rotate-[-8deg]"}`}>
      <div className="absolute right-0 top-0 h-10 w-10 rounded-full border border-white/20 bg-zinc-800 shadow-lg" />
      <div className="absolute right-5 top-8 h-36 w-2 origin-top rounded-full bg-zinc-300 shadow-lg" />
      <div className="absolute bottom-0 right-0 h-8 w-12 rotate-12 rounded-sm bg-zinc-200" />
    </div>
  );
}
