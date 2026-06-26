import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Playlist } from "../playlists/playlist.entity";
import { Track } from "../tracks/track.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, length: 50 })
  username!: string;

  @Column({ name: "password_hash" })
  passwordHash!: string;

  @Column({ name: "display_name", nullable: true, length: 100 })
  displayName?: string;

  @Column({ nullable: true, type: "text" })
  bio?: string;

  @Column({ name: "avatar_path", nullable: true, length: 500 })
  avatarPath?: string;

  @Column({ name: "followers_count", default: 0 })
  followersCount!: number;

  @Column({ name: "following_count", default: 0 })
  followingCount!: number;

  @Column({ name: "current_streak", default: 0 })
  currentStreak!: number;

  @Column({ name: "longest_streak", default: 0 })
  longestStreak!: number;

  @Column({ name: "last_listened_date", type: "date", nullable: true })
  lastListenedDate?: string;

  @Column({ name: "streak_freezes", default: 1 })
  streakFreezes!: number;

  @Column({ name: "is_verified", default: false })
  isVerified!: boolean;

  @OneToMany(() => Track, (track) => track.uploader)
  tracks!: Track[];

  @OneToMany(() => Playlist, (playlist) => playlist.owner)
  playlists!: Playlist[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
