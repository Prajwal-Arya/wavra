import {
  Controller, Get, Headers, Inject, NotFoundException,
  Param, Query, Redirect, Res,
} from "@nestjs/common";
import type { Response } from "express";
import { TracksService } from "../tracks/tracks.service";
import { STORAGE, type IStorageProvider } from "./storage.interface";

@Controller("stream")
export class StreamController {
  constructor(
    private readonly tracksService: TracksService,
    @Inject(STORAGE) private readonly storage: IStorageProvider
  ) {}

  @Get(":trackId/waveform")
  async waveform(@Param("trackId") trackId: string) {
    const track = await this.tracksService.get(trackId);
    return track.waveformData;
  }

  /**
   * Redirect the browser to a pre-signed R2 URL (or local proxy).
   * R2 handles range requests directly — we never proxy large audio through the API.
   */
  @Get(":trackId")
  @Redirect()
  async streamRedirect(@Param("trackId") trackId: string) {
    const track = await this.tracksService.get(trackId);
    const url = await this.storage.getUrl(track.filePath).catch(() => null);
    if (!url) throw new NotFoundException("Audio file not found");
    return { url, statusCode: 302 };
  }

  /**
   * Local-only proxy — LocalStorageService.getUrl() points back here.
   * R2 bypasses this route entirely via the redirect above.
   */
  @Get("file")
  async proxyLocal(
    @Query("key") key: string,
    @Headers("range") range: string | undefined,
    @Res() res: Response
  ) {
    if (!key) throw new NotFoundException();
    try {
      const size = await this.storage.getSize(key);
      const [s, e] = range?.replace("bytes=", "").split("-") ?? ["0", String(size - 1)];
      const start = Number(s);
      const end   = e ? Number(e) : size - 1;

      res.status(range ? 206 : 200).set({
        "Content-Type":   "audio/mpeg",
        "Content-Length": String(end - start + 1),
        "Content-Range":  `bytes ${start}-${end}/${size}`,
        "Accept-Ranges":  "bytes",
      });

      const stream = await this.storage.getStream(key, { start, end });
      (stream as NodeJS.ReadableStream).pipe(res);
    } catch {
      throw new NotFoundException("Audio file not found");
    }
  }
}
