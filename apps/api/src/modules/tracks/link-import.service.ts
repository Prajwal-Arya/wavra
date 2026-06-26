import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { execFile } from "child_process";
import { randomUUID } from "crypto";
import { createWriteStream, promises as fs } from "fs";
import { basename, extname, join } from "path";
import { promisify } from "util";
import { pipeline } from "stream/promises";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Track } from "./track.entity";
import { User } from "../users/user.entity";
import { AudioAnalysisService } from "./audio-analysis.service";

type SourcePlatform = "youtube" | "soundcloud" | "spotify" | "bandcamp" | "direct" | "other";
const execFileAsync = promisify(execFile);

@Injectable()
export class LinkImportService {
  constructor(
    @InjectRepository(Track) private readonly tracks: Repository<Track>,
    private readonly audioAnalysis: AudioAnalysisService
  ) {}

  detectPlatform(url: string): SourcePlatform {
    if (/youtu(\.be|be\.com)/i.test(url)) return "youtube";
    if (/soundcloud\.com/i.test(url)) return "soundcloud";
    if (/open\.spotify\.com/i.test(url)) return "spotify";
    if (/bandcamp\.com/i.test(url)) return "bandcamp";
    if (/\.(mp3|wav|flac|ogg|m4a|aac)(\?.*)?$/i.test(url)) return "direct";
    return "other";
  }

  async import(url: string, uploader: User) {
    const platform = this.detectPlatform(url);
    this.assertImportableUrl(url, platform);
    if (platform === "direct") {
      return this.importDirectAudio(url, uploader, platform);
    }
    if (platform === "spotify") {
      throw new ServiceUnavailableException("Spotify imports need Spotify API credentials plus yt-dlp matching. Try a direct audio or YouTube link for now.");
    }

    return this.importWithYtDlp(url, uploader, platform);
  }

  private assertImportableUrl(url: string, platform: SourcePlatform) {
    if (platform !== "youtube") return;
    const parsed = new URL(url);
    const isVideo = parsed.searchParams.has("v") || parsed.hostname === "youtu.be";
    if (!isVideo) {
      throw new BadRequestException("Paste a YouTube video URL, not a search results, channel, or playlist page.");
    }
  }

  private async importWithYtDlp(url: string, uploader: User, platform: SourcePlatform) {
    const directory = "apps/api/uploads/audio";
    await fs.mkdir(directory, { recursive: true });
    const ytdlpPath = process.env.YTDLP_PATH ?? "yt-dlp";
    const attempts = this.getYtDlpAttempts(platform);

    let lastError = "";
    for (const extraArgs of attempts) {
      const importId = randomUUID();
      const outputBase = join(directory, importId);
      try {
        const { stdout } = await execFileAsync(ytdlpPath, this.buildYtDlpArgs(outputBase, url, extraArgs), {
          maxBuffer: 1024 * 1024 * 10,
          timeout: 120000,
          env: { ...process.env, FFMPEG_BINARY: process.env.FFMPEG_PATH ?? "ffmpeg" }
        });

        const metadata = this.parseYtDlpMetadata(stdout);
        const filePath = `${outputBase}.mp3`;
        const stat = await fs.stat(filePath);
        const analysis = await this.audioAnalysis.analyze(filePath);

        return this.tracks.save(
          this.tracks.create({
            title: metadata.title ?? analysis.title ?? "Imported Track",
            artist: metadata.artist ?? analysis.artist ?? metadata.uploader ?? uploader.displayName ?? uploader.username,
            album: metadata.album ?? analysis.album,
            genre: analysis.genre,
            durationSeconds: analysis.durationSeconds || Number(metadata.duration ?? 0),
            filePath,
            fileSizeBytes: stat.size,
            mimeType: "audio/mpeg",
            coverPath: metadata.thumbnail,
            sourceUrl: url,
            sourcePlatform: platform,
            waveformData: analysis.waveformData,
            uploader
          })
        );
      } catch (error) {
        lastError = this.extractProcessMessage(error);
        await this.deletePartialFiles(outputBase);
      }
    }

    throw this.mapYtDlpError(lastError);
  }

  private buildYtDlpArgs(outputBase: string, url: string, extraArgs: string[]) {
    return [
      "--extract-audio",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      "--no-playlist",
      "--format",
      "bestaudio/best",
      "--print-json",
      "--no-simulate",
      "-o",
      `${outputBase}.%(ext)s`,
      ...extraArgs,
      url
    ];
  }

  private getYtDlpAttempts(platform: SourcePlatform) {
    if (platform !== "youtube") return [[]];
    return [
      ["--extractor-args", "youtube:player_client=android"],
      ["--extractor-args", "youtube:player_client=web"],
      []
    ];
  }

  private extractProcessMessage(error: unknown) {
    if (typeof error === "object" && error !== null) {
      const withOutput = error as { stderr?: string; stdout?: string; message?: string; code?: string };
      return withOutput.stderr || withOutput.stdout || withOutput.message || withOutput.code || "Unknown import error";
    }
    return String(error);
  }

  private mapYtDlpError(message: string) {
    if (message.includes("ENOENT")) {
      return new ServiceUnavailableException("yt-dlp is not installed or YTDLP_PATH is incorrect.");
    }
    if (message.includes("timed out") || message.includes("ETIMEDOUT")) {
      return new BadRequestException("Import timed out. Try a shorter track or a direct video URL.");
    }
    if (message.includes("HTTP Error 403") || message.includes("Forbidden")) {
      return new BadRequestException("YouTube blocked this download format. Try another video URL or a direct audio URL.");
    }
    if (message.includes("Unsupported URL")) {
      return new BadRequestException("This link is not supported by yt-dlp.");
    }
    return new BadRequestException("Could not import this link. Try another video URL or a direct audio URL.");
  }

  private async deletePartialFiles(outputBase: string) {
    const candidates = [".mp3", ".webm", ".m4a", ".part", ".temp.mp3"].map((extension) => `${outputBase}${extension}`);
    await Promise.all(candidates.map((file) => fs.unlink(file).catch(() => undefined)));
  }

  private parseYtDlpMetadata(stdout: string) {
    const lines = stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const jsonLine = [...lines].reverse().find((line) => line.startsWith("{") && line.endsWith("}"));
    if (!jsonLine) return {};
    try {
      return JSON.parse(jsonLine) as {
        title?: string;
        artist?: string;
        uploader?: string;
        album?: string;
        duration?: number;
        thumbnail?: string;
      };
    } catch {
      return {};
    }
  }

  // Public variant used by the seeder — accepts metadata overrides so curated
  // title/artist/genre take precedence over what music-metadata extracts.
  async importDirect(
    url: string,
    uploader: User,
    overrides: { title?: string; artist?: string; genre?: string } = {}
  ) {
    return this.importDirectAudio(url, uploader, "direct", overrides);
  }

  private async importDirectAudio(
    url: string,
    uploader: User,
    platform: SourcePlatform,
    overrides: { title?: string; artist?: string; genre?: string } = {}
  ) {
    const response = await fetch(url);
    if (!response.ok || !response.body) {
      throw new BadRequestException("Could not download audio from this URL");
    }

    const contentType = response.headers.get("content-type") ?? "audio/mpeg";
    if (!contentType.startsWith("audio/") && !url.match(/\.(mp3|wav|flac|ogg|m4a|aac)(\?.*)?$/i)) {
      throw new BadRequestException("URL does not look like a direct audio file");
    }

    const parsed = new URL(url);
    const originalName = basename(parsed.pathname) || "imported-audio.mp3";
    const extension = extname(originalName) || ".mp3";
    const filename = `${randomUUID()}${extension}`;
    const directory = "apps/api/uploads/audio";
    await fs.mkdir(directory, { recursive: true });
    const filePath = join(directory, filename);

    await pipeline(response.body as unknown as NodeJS.ReadableStream, createWriteStream(filePath));
    const stat = await fs.stat(filePath);
    const analysis = await this.audioAnalysis.analyze(filePath);
    const fallbackTitle = originalName.replace(extension, "").replace(/[-_]+/g, " ").trim() || "Imported Track";

    const autoTags = this.audioAnalysis.autoTag(analysis.bpm, analysis.waveformData);
    const genre = overrides.genre ?? analysis.genre ?? autoTags.genre;
    const mood = autoTags.mood;

    return this.tracks.save(
      this.tracks.create({
        title: overrides.title ?? analysis.title ?? fallbackTitle,
        artist: overrides.artist ?? analysis.artist ?? uploader.displayName ?? uploader.username,
        album: analysis.album,
        genre,
        mood,
        bpm: analysis.bpm,
        durationSeconds: analysis.durationSeconds,
        filePath,
        fileSizeBytes: stat.size,
        mimeType: contentType,
        sourceUrl: url,
        sourcePlatform: platform,
        waveformData: analysis.waveformData,
        uploader
      })
    );
  }
}
