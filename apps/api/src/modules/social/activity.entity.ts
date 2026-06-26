import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/user.entity";

@Entity("activities")
export class Activity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @Column({ length: 50 })
  type!: "upload" | "playlist_create" | "follow" | "comment" | "like";

  @Column({ name: "target_type", length: 50 })
  targetType!: "track" | "playlist" | "user" | "comment";

  @Column({ name: "target_id" })
  targetId!: string;

  @Column({ nullable: true, type: "jsonb" })
  metadata?: Record<string, unknown>;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
