import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "../users/user.entity";

@Entity("follows")
@Unique(["follower", "following"])
export class Follow {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  follower!: User;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  following!: User;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
