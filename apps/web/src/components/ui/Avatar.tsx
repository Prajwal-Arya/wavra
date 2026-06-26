import { UserCircle } from "lucide-react";

export function Avatar({ src, label }: { src?: string; label: string }) {
  if (src) return <img className="h-10 w-10 rounded-full object-cover" src={src} alt={label} />;
  return (
    <span className="grid h-10 w-10 place-items-center rounded-full bg-surface text-zinc-400" aria-label={label}>
      <UserCircle size={22} />
    </span>
  );
}
