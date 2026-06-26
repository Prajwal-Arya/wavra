"use client";

import { FormEvent, useEffect, useState } from "react";
import { api, unwrapData } from "@/lib/api";
import type { TrackComment } from "@/types";

export function CommentSection({ trackId }: { trackId: string }) {
  const [comments, setComments] = useState<TrackComment[]>([]);
  const [message, setMessage] = useState("");

  function load() {
    api.get<{ data: TrackComment[] }>(`/tracks/${trackId}/comments`).then((response) => setComments(unwrapData(response))).catch(() => setComments([]));
  }

  useEffect(load, [trackId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const content = String(form.get("content") ?? "").trim();
    if (!content) return;
    try {
      const response = await api.post<{ data: TrackComment }>(`/tracks/${trackId}/comments`, { content });
      setComments((current) => [...current, unwrapData(response)]);
      event.currentTarget.reset();
      setMessage("");
    } catch {
      setMessage("Log in to comment.");
    }
  }

  return (
    <section className="glass-card rounded-md p-5">
      <h2 className="mb-4 text-lg font-semibold">Comments</h2>
      <form className="mb-5 flex gap-3" onSubmit={submit}>
        <input name="content" className="h-10 flex-1 rounded-md border border-white/10 bg-surface px-3 text-sm outline-none focus:border-accent" placeholder="Add a comment" maxLength={1000} />
        <button className="rounded-md bg-white px-4 text-sm font-semibold text-black" type="submit">Post</button>
      </form>
      {message ? <p className="mb-3 text-sm text-coral">{message}</p> : null}
      <div className="space-y-3">
        {comments.length ? comments.map((comment) => (
          <article key={comment.id} className="glass-soft rounded-md p-3">
            <p className="text-sm">{comment.content}</p>
            <p className="mt-2 text-xs text-zinc-500">@{comment.user?.username ?? "user"}</p>
          </article>
        )) : <p className="text-sm text-zinc-400">No comments yet.</p>}
      </div>
    </section>
  );
}
