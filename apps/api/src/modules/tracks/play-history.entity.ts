import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Track } from "./track.entity";

@Entity("play_history")
export class PlayHistory {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { nullable: true, onDelete: "CASCADE" })
  user?: User;

  @ManyToOne(() => Track, { onDelete: "CASCADE" })
  track!: Track;

  @CreateDateColumn({ name: "played_at", type: "timestamptz" })
  playedAt!: Date;
}
