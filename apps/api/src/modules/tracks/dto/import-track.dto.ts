import { IsUrl } from "class-validator";

export class ImportTrackDto {
  @IsUrl({ require_protocol: true })
  url!: string;
}
