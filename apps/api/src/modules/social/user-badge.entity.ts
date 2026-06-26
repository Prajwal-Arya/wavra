import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "../users/user.entity";

@Entity("user_badges")
@Unique(["user", "badgeType"])
export class UserBadge {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  user!: User;

  @Column({ name: "badge_type", length: 50 })
  badgeType!: string;

  @CreateDateColumn({ name: "earned_at", type: "timestamptz" })
  earnedAt!: Date;
}
