"use client";

import { useEffect, useRef } from "react";
import { api, getApiBaseUrl } from "@/lib/api";
import { usePlayer } from "@/hooks/usePlayer";

export function AudioPlayer() {
  const player = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const sourceReadyRef = useRef(false);
  const loggedTrackRef = useRef<string | null>(null);
  const streamUrl = player.currentTrack ? `${getApiBaseUrl()}/stream/${player.currentTrack.id}` : undefined;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = player.volume;
  }, [player.volume]);

  useEffect(() => {
    filtersRef.current.forEach((filter, index) => {
      filter.gain.value = player.equalizer[index] ?? 0;
    });
  }, [player.equalizer]);

  useEffect(() => {
    function onSeek(event: Event) {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(audio.duration)) return;
      const progress = (event as CustomEvent<number>).detail;
      audio.currentTime = (progress / 100) * audio.duration;
    }

    window.addEventListener("wavra:seek", onSeek);
    return () => window.removeEventListener("wavra:seek", onSeek);
  }, []);

  useEffect(() => {
    function onSeekSeconds(event: Event) {
      const audio = audioRef.current;
      if (!audio || !Number.isFinite(audio.duration)) return;
      audio.currentTime = Math.min(audio.duration, Math.max(0, audio.currentTime + (event as CustomEvent<number>).detail));
      player.setProgress((audio.currentTime / audio.duration) * 100);
    }

    window.addEventListener("wavra:seek-seconds", onSeekSeconds);
    return () => window.removeEventListener("wavra:seek-seconds", onSeekSeconds);
  }, [player]);

  useEffect(() => {
    if (!player.sleepTimerEnd) return;
    const interval = window.setInterval(() => {
      if (Date.now() >= player.sleepTimerEnd!) {
        player.pause();
        player.setSleepTimer(null);
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, [player]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (player.isPlaying && player.currentTrack) {
      if (!sourceReadyRef.current && typeof window !== "undefined") {
        try {
          const context = new AudioContext();
          const source = context.createMediaElementSource(audio);
          const freqs = [60, 250, 1000, 4000, 12000];
          const filters = freqs.map((frequency, index) => {
            const filter = context.createBiquadFilter();
            filter.type = "peaking";
            filter.frequency.value = frequency;
            filter.Q.value = 1;
            filter.gain.value = player.equalizer[index] ?? 0;
            return filter;
          });
          source.connect(filters[0]);
          filters.forEach((filter, index) => {
            filter.connect(filters[index + 1] ?? context.destination);
          });
          audioContextRef.current = context;
          filtersRef.current = filters;
          sourceReadyRef.current = true;
        } catch {
          sourceReadyRef.current = true;
        }
      }
      void audioContextRef.current?.resume();
      if (loggedTrackRef.current !== player.currentTrack.id) {
        loggedTrackRef.current = player.currentTrack.id;
        void api.post(`/tracks/${player.currentTrack.id}/play`).catch(() => undefined);
      }
      void audio.play().catch(() => player.pause());
    } else {
      audio.pause();
    }
  }, [player, player.currentTrack, player.isPlaying]);

  return (
    <audio
      ref={audioRef}
      src={streamUrl}
      crossOrigin="anonymous"
      preload="metadata"
      onLoadedMetadata={(event) => player.setDuration(event.currentTarget.duration || player.currentTrack?.durationSeconds || 0)}
      onTimeUpdate={(event) => {
        const audio = event.currentTarget;
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          player.setProgress((audio.currentTime / audio.duration) * 100);
        }
      }}
      onEnded={player.next}
    />
  );
}
