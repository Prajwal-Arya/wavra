export interface IStorageProvider {
  /** Save a file — returns a stable key (local path or R2 object key). */
  save(category: "audio" | "covers" | "avatars", filename: string, data: Buffer): Promise<string>;

  /** Stream bytes with optional range for audio seeking. */
  getStream(key: string, opts?: { start?: number; end?: number }): Promise<NodeJS.ReadableStream>;

  /** Total byte size of a stored file. */
  getSize(key: string): Promise<number>;

  /** Public or pre-signed URL the browser can fetch directly. */
  getUrl(key: string, expiresIn?: number): Promise<string>;

  /** Delete a stored file. */
  delete(key: string): Promise<void>;
}

export const STORAGE = "STORAGE_PROVIDER";
