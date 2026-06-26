import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Track } from "./track.entity";

@Entity("track_comments")
export class TrackComment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => Track, { onDelete: "CASCADE" })
  track!: Track;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => TrackComment, { nullable: true, onDelete: "CASCADE" })
  parent?: TrackComment | null;

  @Column({ type: "text" })
  content!: string;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
