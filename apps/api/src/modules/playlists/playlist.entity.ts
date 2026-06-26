import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../users/user.entity";
import { PlaylistTrack } from "./playlist-track.entity";

@Entity("playlists")
export class Playlist {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true, type: "text" })
  description?: string;

  @Column({ name: "cover_path", nullable: true, length: 500 })
  coverPath?: string;

  @Column({ name: "is_public", default: true })
  isPublic!: boolean;

  @Column({ name: "is_system", default: false })
  isSystem!: boolean;

  @Column({ name: "is_collaborative", default: false })
  isCollaborative!: boolean;

  @Column({ name: "invite_code", unique: true, nullable: true, length: 20 })
  inviteCode?: string;

  @ManyToOne(() => User, (user) => user.playlists, { onDelete: "CASCADE" })
  owner!: User;

  @OneToMany(() => PlaylistTrack, (playlistTrack) => playlistTrack.playlist)
  playlistTracks!: PlaylistTrack[];

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
  updatedAt!: Date;
}
