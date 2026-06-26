import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Track } from "../tracks/track.entity";
import { Playlist } from "./playlist.entity";

@Entity("playlist_tracks")
@Unique(["playlist", "track"])
export class PlaylistTrack {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Playlist, (playlist) => playlist.playlistTracks, { onDelete: "CASCADE" })
  playlist!: Playlist;

  @ManyToOne(() => Track, { onDelete: "CASCADE" })
  track!: Track;

  @Column()
  position!: number;

  @CreateDateColumn({ name: "added_at", type: "timestamptz" })
  addedAt!: Date;
}
