"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";

export default function MyProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loadMe } = useAuthStore();

  useEffect(() => {
    async function go() {
      if (!isAuthenticated) {
        try { await loadMe(); } catch { router.replace("/login"); return; }
      }
      const id = useAuthStore.getState().user?.id;
      if (id) router.replace(`/profile/${id}`);
      else router.replace("/login");
    }
    void go();
  }, [isAuthenticated, loadMe, router]);

  return (
    <div className="flex h-64 items-center justify-center text-zinc-500 text-sm">
      Loading profile…
    </div>
  );
}
