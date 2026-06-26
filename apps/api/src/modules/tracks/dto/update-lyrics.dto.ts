import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class UpdateLyricsDto {
  @IsString()
  @MaxLength(20000)
  lyrics!: string;

  @IsOptional()
  @IsBoolean()
  lyricsSynced?: boolean;
}
