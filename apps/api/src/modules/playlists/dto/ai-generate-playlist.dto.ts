import { IsString, MaxLength, MinLength } from "class-validator";

export class AiGeneratePlaylistDto {
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  prompt!: string;
}
