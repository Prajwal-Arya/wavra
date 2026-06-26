"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export function FollowButton({ userId }: { userId: string }) {
  const [following, setFollowing] = useState(false);
  const [message, setMessage] = useState("");

  async function toggle() {
    try {
      if (following) {
        await api.delete(`/users/${userId}/follow`);
        setFollowing(false);
      } else {
        await api.post(`/users/${userId}/follow`);
        setFollowing(true);
      }
      setMessage("");
    } catch {
      setMessage("Log in to follow.");
    }
  }

  return (
    <div>
      <button className="rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/10" onClick={() => void toggle()}>{following ? "Unfollow" : "Follow"}</button>
      {message ? <p className="mt-1 text-xs text-coral">{message}</p> : null}
    </div>
  );
}
