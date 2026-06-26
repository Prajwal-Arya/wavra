import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "../users/user.entity";
import { Playlist } from "./playlist.entity";

@Entity("playlist_collaborators")
@Unique(["playlist", "user"])
export class PlaylistCollaborator {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Playlist, { onDelete: "CASCADE" })
  playlist!: Playlist;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @Column({ default: "editor" })
  role!: "editor" | "viewer";

  @CreateDateColumn({ name: "joined_at", type: "timestamptz" })
  joinedAt!: Date;
}
