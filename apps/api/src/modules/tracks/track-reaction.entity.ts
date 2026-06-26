import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "../users/user.entity";
import { Track } from "./track.entity";

@Entity("track_reactions")
@Unique(["track", "user", "timestamp"])
export class TrackReaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Track, { onDelete: "CASCADE" })
  track!: Track;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @Column({ length: 10 })
  emoji!: string;

  @Column({ type: "float" })
  timestamp!: number;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
