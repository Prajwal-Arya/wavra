import { IsNumber, IsString, MaxLength, Min } from "class-validator";

export class CreateReactionDto {
  @IsString()
  @MaxLength(10)
  emoji!: string;

  @IsNumber()
  @Min(0)
  timestamp!: number;
}
