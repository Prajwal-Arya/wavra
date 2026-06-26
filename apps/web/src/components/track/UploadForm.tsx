"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { api } from "@/lib/api";
import { moods } from "@/lib/moods";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setStatus("Choose an audio file first.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("file", file);
    setIsUploading(true);
    setStatus(null);

    try {
      await api.post("/tracks", formData);
      router.push("/");
      router.refresh();
    } catch {
      setStatus("Upload failed. Log in first, then try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="space-y-4 rounded-md border border-white/10 bg-panel p-6" onSubmit={submit}>
      <label className="grid min-h-44 cursor-pointer place-items-center rounded-md border border-dashed border-white/20 bg-surface text-center hover:border-accent">
        <input className="sr-only" name="file" type="file" accept="audio/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        <span className="flex flex-col items-center gap-3 text-sm text-zinc-300">
          <Upload size={28} />
          {file ? file.name : "Drop audio here or choose a file"}
        </span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="title" placeholder="Title" />
        <Input name="artist" placeholder="Artist" />
        <Input name="album" placeholder="Album" />
        <div className="relative">
          <Input name="genre" placeholder="Genre" />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">auto-tagged if blank</span>
        </div>
        <Input name="scheduledReleaseAt" type="datetime-local" />
        <select name="mood" className="h-10 w-full rounded-md border border-white/10 bg-surface px-3 text-sm text-white outline-none transition focus:border-accent">
          <option value="">Mood (auto-tagged if blank)</option>
          {moods.map((mood) => (
            <option key={mood} value={mood}>
              {mood[0].toUpperCase() + mood.slice(1)}
            </option>
          ))}
        </select>
      </div>
      {status ? <p className="text-sm text-coral">{status}</p> : null}
      <Button disabled={isUploading} type="submit">
        {isUploading ? "Uploading..." : "Upload"}
      </Button>
    </form>
  );
}
