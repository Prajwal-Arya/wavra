"use client";

export function EmbedCode({ trackId }: { trackId: string }) {
  const src = typeof window === "undefined" ? `/embed/${trackId}` : `${window.location.origin}/embed/${trackId}`;
  const code = `<iframe src="${src}" width="520" height="120" frameborder="0" allow="autoplay"></iframe>`;

  return (
    <section className="glass-card rounded-md p-5">
      <h2 className="mb-3 text-lg font-semibold">Embed</h2>
      <textarea className="h-20 w-full rounded-md border border-white/10 bg-surface p-3 text-xs text-zinc-300" readOnly value={code} />
    </section>
  );
}
