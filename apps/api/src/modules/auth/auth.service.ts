import { ConflictException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginDto } from "./dto/login.dto";
import { SignupDto } from "./dto/signup.dto";
import { UsersService } from "../users/users.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async signup(dto: SignupDto) {
    const existingEmail = await this.usersService.findByEmail(dto.email);
    if (existingEmail) throw new ConflictException("Email already registered");
    const existingUsername = await this.usersService.findByUsername(dto.username);
    if (existingUsername) throw new ConflictException("Username already registered");
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({
      email: dto.email,
      username: dto.username,
      displayName: dto.displayName,
      passwordHash
    });
    return this.issueToken(user.id, this.usersService.toPublicUser(user));
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException("Invalid credentials");
    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException("Invalid credentials");
    return this.issueToken(user.id, this.usersService.toPublicUser(user));
  }

  private issueToken(userId: string, user: unknown) {
    return {
      accessToken: this.jwtService.sign({ sub: userId }),
      user
    };
  }
}
