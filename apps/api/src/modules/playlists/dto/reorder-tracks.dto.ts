import { IsArray, IsUUID } from "class-validator";

export class ReorderTracksDto {
  @IsArray()
  @IsUUID("4", { each: true })
  orderedTrackIds!: string[];
}
