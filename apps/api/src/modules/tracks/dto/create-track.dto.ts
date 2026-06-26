import { IsBooleanString, IsDateString, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateTrackDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  artist?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  album?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  genre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  mood?: string;

  @IsOptional()
  @IsDateString()
  scheduledReleaseAt?: string;

  @IsOptional()
  @IsBooleanString()
  isPublished?: string;
}
