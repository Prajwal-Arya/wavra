import { Injectable } from "@nestjs/common";
import { execFile } from "child_process";
import { promisify } from "util";
import { parseFile } from "music-metadata";

const execFileAsync = promisify(execFile);

// BPM → likely genre/mood mappings (heuristic, not ML)
const BPM_RULES: Array<{ min: number; max: number; lowEnergy: { genre: string; mood: string }; highEnergy: { genre: string; mood: string } }> = [
  { min: 0,   max: 70,  lowEnergy: { genre: "Ambient",    mood: "dreamy" }, highEnergy: { genre: "Ambient",     mood: "chill"    } },
  { min: 70,  max: 95,  lowEnergy: { genre: "R&B",        mood: "chill"  }, highEnergy: { genre: "Hip-Hop",     mood: "chill"    } },
  { min: 95,  max: 115, lowEnergy: { genre: "Pop",        mood: "happy"  }, highEnergy: { genre: "Pop",         mood: "hype"     } },
  { min: 115, max: 130, lowEnergy: { genre: "Indie",      mood: "happy"  }, highEnergy: { genre: "House",       mood: "hype"     } },
  { min: 130, max: 150, lowEnergy: { genre: "Electronic", mood: "focus"  }, highEnergy: { genre: "Dance",       mood: "hype"     } },
  { min: 150, max: 999, lowEnergy: { genre: "Electronic", mood: "hype"   }, highEnergy: { genre: "Drum & Bass", mood: "hype"     } },
];

@Injectable()
export class AudioAnalysisService {
  async analyze(filePath: string, buckets = 150) {
    const [metadata, waveformData] = await Promise.all([
      this.readMetadata(filePath),
      this.computeWaveform(filePath, buckets)
    ]);
    return { ...metadata, waveformData };
  }

  autoTag(bpm: number | undefined, waveformData: number[]): { genre?: string; mood?: string } {
    if (!bpm) return {};
    const avgEnergy = waveformData.length ? waveformData.reduce((a, b) => a + b, 0) / waveformData.length : 0;
    const isHighEnergy = avgEnergy > 0.45;
    const rule = BPM_RULES.find((r) => bpm >= r.min && bpm < r.max);
    if (!rule) return {};
    return isHighEnergy ? rule.highEnergy : rule.lowEnergy;
  }

  private async readMetadata(filePath: string) {
    try {
      const metadata = await parseFile(filePath);
      return {
        title: metadata.common.title,
        artist: metadata.common.artist,
        album: metadata.common.album,
        genre: metadata.common.genre?.[0],
        durationSeconds: metadata.format.duration ?? 0,
        bpm: metadata.common.bpm ? Math.round(metadata.common.bpm) : await this.detectBpm(filePath)
      };
    } catch {
      return { durationSeconds: 0 };
    }
  }

  private async detectBpm(filePath: string): Promise<number | undefined> {
    try {
      const ffmpegPath = process.env.FFMPEG_PATH ?? "ffmpeg";
      // Extract ~30s of mono audio at 22050 Hz for BPM analysis
      const { stdout } = await execFileAsync(
        ffmpegPath,
        ["-v", "error", "-i", filePath, "-ac", "1", "-ar", "22050", "-t", "30", "-f", "s16le", "-"],
        { encoding: "buffer", maxBuffer: 1024 * 1024 * 64, timeout: 20000 }
      );
      const samples = this.bufferToSamples(stdout as Buffer);
      if (samples.length < 1000) return undefined;
      return this.estimateBpm(samples, 22050);
    } catch {
      return undefined;
    }
  }

  private estimateBpm(samples: number[], sampleRate: number): number {
    // Onset detection via energy differences across 10ms windows
    const windowSize = Math.floor(sampleRate * 0.01);
    const energies: number[] = [];
    for (let i = 0; i + windowSize < samples.length; i += windowSize) {
      const slice = samples.slice(i, i + windowSize);
      energies.push(slice.reduce((sum, s) => sum + s * s, 0) / windowSize);
    }
    // Compute flux (positive energy increases = onsets)
    const flux = energies.map((e, i) => (i === 0 ? 0 : Math.max(0, e - energies[i - 1])));
    // Autocorrelation over beat range (60–180 BPM)
    const minLag = Math.floor((60 / 180) * (sampleRate / windowSize));
    const maxLag = Math.floor((60 / 60) * (sampleRate / windowSize));
    let bestLag = minLag;
    let bestCorr = -Infinity;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let corr = 0;
      for (let i = 0; i + lag < flux.length; i++) corr += flux[i] * flux[i + lag];
      if (corr > bestCorr) { bestCorr = corr; bestLag = lag; }
    }
    const bpm = Math.round((60 * sampleRate) / (bestLag * windowSize));
    // Clamp to sane range
    return Math.min(200, Math.max(60, bpm));
  }

  private async computeWaveform(filePath: string, buckets: number) {
    try {
      const ffmpegPath = process.env.FFMPEG_PATH ?? "ffmpeg";
      const { stdout } = await execFileAsync(
        ffmpegPath,
        ["-v", "error", "-i", filePath, "-ac", "1", "-ar", "8000", "-f", "s16le", "-"],
        { encoding: "buffer", maxBuffer: 1024 * 1024 * 24, timeout: 30000 }
      );
      const samples = this.bufferToSamples(stdout as Buffer);
      if (!samples.length) return this.emptyWaveform(buckets);
      return this.samplesToBuckets(samples, buckets);
    } catch {
      return this.emptyWaveform(buckets);
    }
  }

  private bufferToSamples(buffer: Buffer) {
    const samples: number[] = [];
    for (let offset = 0; offset + 1 < buffer.length; offset += 2) {
      samples.push(Math.abs(buffer.readInt16LE(offset)) / 32768);
    }
    return samples;
  }

  private samplesToBuckets(samples: number[], buckets: number) {
    const bucketSize = Math.max(1, Math.floor(samples.length / buckets));
    const values = Array.from({ length: buckets }, (_, index) => {
      const start = index * bucketSize;
      const end = index === buckets - 1 ? samples.length : Math.min(samples.length, start + bucketSize);
      const slice = samples.slice(start, end);
      if (!slice.length) return 0;
      const rms = Math.sqrt(slice.reduce((sum, sample) => sum + sample * sample, 0) / slice.length);
      return Number(Math.min(1, rms * 2.6).toFixed(4));
    });
    const peak = Math.max(...values, 0.001);
    return values.map((value) => Number((value / peak).toFixed(4)));
  }

  private emptyWaveform(buckets: number) {
    return Array.from({ length: buckets }, () => 0);
  }
}
