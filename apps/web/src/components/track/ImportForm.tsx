"use client";

import { FormEvent, useMemo, useState } from "react";
import { Link as LinkIcon } from "lucide-react";
import { api, unwrapData } from "@/lib/api";
import { getRequestErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Track } from "@/types";

function detectPlatform(url: string) {
  if (/youtu(\.be|be\.com)/i.test(url)) return "YouTube";
  if (/soundcloud\.com/i.test(url)) return "SoundCloud";
  if (/open\.spotify\.com/i.test(url)) return "Spotify";
  if (/bandcamp\.com/i.test(url)) return "Bandcamp";
  if (/\.(mp3|wav|flac|ogg|m4a|aac)(\?.*)?$/i.test(url)) return "Direct audio";
  return "Supported link";
}

function validateUrl(url: string) {
  try {
    const parsed = new URL(url);
    const isYouTube = /youtu(\.be|be\.com)/i.test(url);
    if (isYouTube && parsed.hostname !== "youtu.be" && !parsed.searchParams.has("v")) {
      return "Paste a YouTube video URL, not a search results page.";
    }
    return null;
  } catch {
    return "Enter a valid URL.";
  }
}

export function ImportForm() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const platform = useMemo(() => (url ? detectPlatform(url) : null), [url]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsImporting(true);
    const validationError = validateUrl(url);
    if (validationError) {
      setStatus(validationError);
      setIsImporting(false);
      return;
    }

    setStatus(`Extracting audio from ${platform ?? "link"}...`);
    setTrack(null);

    try {
      const response = await api.post<{ data: Track }>("/tracks/import", { url }, { timeout: 150000 });
      setTrack(unwrapData(response));
      setStatus("Added to library.");
    } catch (error) {
      setStatus(getRequestErrorMessage(error, "Import failed."));
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <form className="glass-card space-y-5 rounded-md p-6" onSubmit={submit}>
      <div>
        <p className="text-sm font-semibold text-accent">Import from link</p>
        <p className="mt-1 text-sm text-zinc-400">Paste a direct audio URL now. YouTube, SoundCloud, Spotify, and more are ready once yt-dlp is installed on the server.</p>
      </div>
      <div className="relative">
        <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
        <Input className="pl-10" placeholder="https://example.com/song.mp3" type="url" value={url} onChange={(event) => setUrl(event.target.value)} required />
      </div>
      {platform ? (
        <div className="rounded-md border border-white/10 bg-white/5 p-4 text-sm">
          <p className="font-semibold">{platform}</p>
          <p className="mt-1 truncate text-zinc-400">{url}</p>
        </div>
      ) : null}
      {status ? <p className="text-sm text-zinc-300">{status}</p> : null}
      {track ? (
        <div className="rounded-md border border-white/10 bg-white/5 p-4">
          <p className="font-semibold">{track.title}</p>
          <p className="text-sm text-zinc-400">{track.artist}</p>
        </div>
      ) : null}
      <Button disabled={isImporting} type="submit">
        {isImporting ? "Importing..." : "Import to Library"}
      </Button>
    </form>
  );
}
