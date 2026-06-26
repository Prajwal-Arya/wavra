import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";
import type { IStorageProvider } from "./storage.interface";

@Injectable()
export class R2StorageService implements IStorageProvider, OnModuleInit {
  private readonly logger = new Logger(R2StorageService.name);
  private client: S3Client;
  private bucket: string;
  private publicUrl: string | undefined;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const accountId  = this.config.getOrThrow<string>("R2_ACCOUNT_ID");
    const accessKey  = this.config.getOrThrow<string>("R2_ACCESS_KEY_ID");
    const secretKey  = this.config.getOrThrow<string>("R2_SECRET_ACCESS_KEY");
    this.bucket      = this.config.getOrThrow<string>("R2_BUCKET");
    this.publicUrl   = this.config.get<string>("R2_PUBLIC_URL"); // optional custom domain

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    });

    this.logger.log(`R2 storage active — bucket: ${this.bucket}`);
  }

  async save(
    category: "audio" | "covers" | "avatars",
    filename: string,
    data: Buffer
  ): Promise<string> {
    const key = `${category}/${filename}`;
    const contentType = this.contentTypeFor(category, filename);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: data,
        ContentType: contentType,
      })
    );

    return key; // stored as the object key
  }

  async getStream(
    key: string,
    opts?: { start?: number; end?: number }
  ): Promise<NodeJS.ReadableStream> {
    const range =
      opts?.start !== undefined
        ? `bytes=${opts.start}-${opts.end ?? ""}`
        : undefined;

    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key, Range: range })
    );

    return res.Body as Readable;
  }

  async getSize(key: string): Promise<number> {
    const res = await this.client.send(
      new HeadObjectCommand({ Bucket: this.bucket, Key: key })
    );
    return res.ContentLength ?? 0;
  }

  async getUrl(key: string, expiresIn = 3600): Promise<string> {
    // If a public bucket URL is configured, return it directly (no signing needed)
    if (this.publicUrl) {
      return `${this.publicUrl.replace(/\/$/, "")}/${key}`;
    }
    // Otherwise return a pre-signed URL valid for `expiresIn` seconds
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      { expiresIn }
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    );
  }

  private contentTypeFor(category: string, filename: string): string {
    if (category === "audio") {
      if (filename.endsWith(".mp3"))  return "audio/mpeg";
      if (filename.endsWith(".wav"))  return "audio/wav";
      if (filename.endsWith(".flac")) return "audio/flac";
      if (filename.endsWith(".ogg"))  return "audio/ogg";
      return "audio/mpeg";
    }
    if (filename.endsWith(".png"))  return "image/png";
    if (filename.endsWith(".webp")) return "image/webp";
    return "image/jpeg";
  }
}
