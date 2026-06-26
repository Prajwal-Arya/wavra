import { Injectable } from "@nestjs/common";
import { createReadStream, promises as fs } from "fs";
import { join } from "path";
import type { IStorageProvider } from "./storage.interface";

@Injectable()
export class LocalStorageService implements IStorageProvider {
  private readonly root = process.env.UPLOAD_DIR ?? "uploads";

  async save(category: "audio" | "covers" | "avatars", filename: string, data: Buffer) {
    const dir = join(this.root, category);
    await fs.mkdir(dir, { recursive: true });
    const key = join(dir, filename);
    await fs.writeFile(key, data);
    return key;
  }

  async getStream(key: string, opts?: { start?: number; end?: number }): Promise<NodeJS.ReadableStream> {
    return createReadStream(key, opts);
  }

  async getSize(key: string) {
    const stat = await fs.stat(key);
    return stat.size;
  }

  async getUrl(key: string) {
    const base = process.env.API_BASE_URL ?? "http://localhost:3001";
    return `${base}/stream/file?key=${encodeURIComponent(key)}`;
  }

  async delete(key: string) {
    await fs.unlink(key);
  }

  // Legacy shims used by stream.controller until fully migrated
  getReadStream(key: string, opts?: { start?: number; end?: number }) {
    return createReadStream(key, opts);
  }
  async getFileSize(key: string) {
    return this.getSize(key);
  }
}
