import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity";

@Entity("tracks")
export class Track {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column()
  artist!: string;

  @Column({ nullable: true })
  album?: string;

  @Column({ nullable: true, length: 100 })
  genre?: string;

  @Column({ nullable: true, length: 20 })
  mood?: string;

  @Column({ name: "duration_seconds", type: "float", default: 0 })
  durationSeconds!: number;

  @Column({ name: "file_path", length: 500 })
  filePath!: string;

  @Column({ name: "cover_path", nullable: true, length: 500 })
  coverPath?: string;

  @Column({ name: "source_url", nullable: true, length: 1000 })
  sourceUrl?: string;

  @Column({ name: "source_platform", nullable: true, length: 50 })
  sourcePlatform?: string;

  @Column({ name: "file_size_bytes", type: "bigint", default: 0 })
  fileSizeBytes!: number;

  @Column({ name: "mime_type", nullable: true, length: 50 })
  mimeType?: string;

  @Column({ name: "waveform_data", type: "jsonb", default: () => "'[]'::jsonb" })
  waveformData!: number[];

  @Column({ nullable: true })
  bpm?: number;

  @Column({ name: "scheduled_release_at", type: "timestamptz", nullable: true })
  scheduledReleaseAt?: Date;

  @Column({ name: "is_published", default: true })
  isPublished!: boolean;

  @Column({ nullable: true, type: "text" })
  lyrics?: string;

  @Column({ name: "lyrics_synced", default: false })
  lyricsSynced!: boolean;

  @Column({ name: "play_count", default: 0 })
  playCount!: number;

  @ManyToOne(() => User, (user) => user.tracks, { onDelete: "CASCADE" })
  uploader!: User;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
