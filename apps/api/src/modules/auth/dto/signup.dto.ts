import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MaxLength(50)
  username!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;
}
