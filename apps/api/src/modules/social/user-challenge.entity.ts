import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../users/user.entity";
import { Challenge } from "./challenge.entity";

@Entity("user_challenges")
export class UserChallenge {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @ManyToOne(() => Challenge, { onDelete: "CASCADE" })
  challenge!: Challenge;

  @Column({ default: 0 })
  progress!: number;

  @Column({ default: false })
  completed!: boolean;

  @Column({ name: "completed_at", type: "timestamptz", nullable: true })
  completedAt?: Date;
}
