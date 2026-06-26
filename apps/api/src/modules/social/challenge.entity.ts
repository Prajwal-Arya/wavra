import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("challenges")
export class Challenge {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column({ length: 50 })
  type!: "daily" | "weekly" | "monthly";

  @Column({ name: "target_value" })
  targetValue!: number;

  @Column({ length: 50 })
  metric!: "new_artists" | "genres" | "minutes" | "tracks";

  @Column({ name: "starts_at", type: "timestamptz" })
  startsAt!: Date;

  @Column({ name: "ends_at", type: "timestamptz" })
  endsAt!: Date;
}
