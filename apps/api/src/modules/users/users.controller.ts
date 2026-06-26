import { Body, Controller, Get, Param, Patch, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { User } from "./user.entity";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get("me/stats")
  getStats(@CurrentUser() user: User) {
    return this.usersService.getStats(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/stats/top-tracks")
  topTracks(@CurrentUser() user: User, @Query("limit") limit?: string) {
    return this.usersService.topTracks(user, limit ? Number(limit) : 10);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/analytics")
  analytics(@CurrentUser() user: User) {
    return this.usersService.analytics(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me/analytics/tracks")
  trackAnalytics(@CurrentUser() user: User) {
    return this.usersService.trackAnalytics(user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me")
  updateMe(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("me/avatar")
  @UseInterceptors(FileInterceptor("file", { storage: diskStorage({ destination: "apps/api/uploads/avatars" }) }))
  updateAvatar(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    return this.usersService.updateAvatar(user, file);
  }

  @Get(":id/tracks")
  getTracks(@Param("id") id: string) {
    return this.usersService.tracksByUser(id);
  }

  @Get(":id/upcoming")
  getUpcoming(@Param("id") id: string) {
    return this.usersService.upcomingByUser(id);
  }

  @Get(":id/playlists")
  getPlaylists(@Param("id") id: string) {
    return this.usersService.playlistsByUser(id);
  }

  @Get(":id")
  getProfile(@Param("id") id: string) {
    return this.usersService.getPublicProfile(id);
  }
}
