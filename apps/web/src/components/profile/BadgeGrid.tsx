"use client";

import { useEffect, useState } from "react";
import { api, unwrapData } from "@/lib/api";
import type { UserBadge } from "@/types";

export function BadgeGrid({ userId }: { userId: string }) {
  const [badges, setBadges] = useState<UserBadge[]>([]);

  useEffect(() => {
    api.get<{ data: UserBadge[] }>(`/users/${userId}/badges`).then((response) => setBadges(unwrapData(response))).catch(() => setBadges([]));
  }, [userId]);

  if (!badges.length) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span key={badge.id} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs text-accent">{badge.badgeType.replace("_", " ")}</span>
      ))}
    </div>
  );
}
