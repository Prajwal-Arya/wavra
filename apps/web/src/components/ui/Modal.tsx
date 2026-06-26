import type { PropsWithChildren } from "react";

export function Modal({ children }: PropsWithChildren) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-md border border-white/10 bg-panel p-5">{children}</div>
    </div>
  );
}
