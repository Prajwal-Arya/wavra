import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "../users/user.entity";
import { PlaylistTrack } from "./playlist-track.entity";

@Entity("playlist_votes")
@Unique(["playlistTrack", "user"])
export class PlaylistVote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => PlaylistTrack, { onDelete: "CASCADE" })
  playlistTrack!: PlaylistTrack;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @Column()
  value!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
