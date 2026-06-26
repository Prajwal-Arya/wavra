import { IsBoolean, IsOptional, IsString, MaxLength } from "class-validator";

export class CreatePlaylistDto {
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isCollaborative?: boolean;
}
