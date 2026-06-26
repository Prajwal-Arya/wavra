import { Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { User } from "../users/user.entity";
import { SocialService } from "./social.service";

@Controller()
export class SocialController {
  constructor(private readonly social: SocialService) {}

  @UseGuards(JwtAuthGuard)
  @Post("users/:id/follow")
  follow(@Param("id") id: string, @CurrentUser() user: User) {
    return this.social.follow(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("users/:id/follow")
  unfollow(@Param("id") id: string, @CurrentUser() user: User) {
    return this.social.unfollow(id, user);
  }

  @Get("users/:id/followers")
  followers(@Param("id") id: string) {
    return this.social.followers(id);
  }

  @Get("users/:id/following")
  following(@Param("id") id: string) {
    return this.social.following(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("feed")
  feed(@CurrentUser() user: User, @Query("limit") limit?: string) {
    return this.social.feed(user, limit ? Number(limit) : 30);
  }

  @Get("badges")
  badges() {
    return this.social.badgesCatalog();
  }

  @Get("users/:id/badges")
  userBadges(@Param("id") id: string) {
    return this.social.userBadges(id);
  }

  @Get("leaderboards/:type")
  leaderboards(@Param("type") type: string, @Query("limit") limit?: string) {
    return this.social.leaderboards(type, limit ? Number(limit) : 20);
  }

  @UseGuards(JwtAuthGuard)
  @Get("challenges")
  challenges(@CurrentUser() user: User) {
    return this.social.activeChallenges(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("admin/users/:id/verify")
  verify(@Param("id") id: string, @CurrentUser() user: User) {
    return this.social.verifyUser(id, user);
  }
}
