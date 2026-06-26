import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { User } from "../users/user.entity";
import { AiGeneratePlaylistDto } from "./dto/ai-generate-playlist.dto";
import { CreatePlaylistDto } from "./dto/create-playlist.dto";
import { ReorderTracksDto } from "./dto/reorder-tracks.dto";
import { PlaylistsService } from "./playlists.service";

@Controller("playlists")
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Get()
  list() {
    return this.playlistsService.listPublic();
  }

  @UseGuards(JwtAuthGuard)
  @Post("ai-generate")
  aiGenerate(@Body() dto: AiGeneratePlaylistDto, @CurrentUser() user: User) {
    return this.playlistsService.aiGenerate(dto.prompt, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get("daily-mixes")
  dailyMixes(@CurrentUser() user: User) {
    return this.playlistsService.dailyMixes(user);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.playlistsService.get(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePlaylistDto, @CurrentUser() user: User) {
    return this.playlistsService.create(dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: Partial<CreatePlaylistDto>, @CurrentUser() user: User) {
    return this.playlistsService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: User) {
    return this.playlistsService.remove(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/tracks/:trackId")
  addTrack(@Param("id") id: string, @Param("trackId") trackId: string, @CurrentUser() user: User) {
    return this.playlistsService.addTrack(id, trackId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id/tracks/:trackId")
  removeTrack(@Param("id") id: string, @Param("trackId") trackId: string, @CurrentUser() user: User) {
    return this.playlistsService.removeTrack(id, trackId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/tracks/reorder")
  reorder(@Param("id") id: string, @Body() dto: ReorderTracksDto, @CurrentUser() user: User) {
    return this.playlistsService.reorder(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/invite")
  invite(@Param("id") id: string, @CurrentUser() user: User) {
    return this.playlistsService.invite(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post("join/:inviteCode")
  join(@Param("inviteCode") inviteCode: string, @CurrentUser() user: User) {
    return this.playlistsService.join(inviteCode, user);
  }

  @Get(":id/collaborators")
  collaborators(@Param("id") id: string) {
    return this.playlistsService.listCollaborators(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id/collaborators/:userId")
  removeCollaborator(@Param("id") id: string, @Param("userId") userId: string, @CurrentUser() user: User) {
    return this.playlistsService.removeCollaborator(id, userId, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/tracks/:trackId/vote")
  vote(@Param("id") id: string, @Param("trackId") trackId: string, @Body("value") value: number, @CurrentUser() user: User) {
    return this.playlistsService.vote(id, trackId, Number(value), user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id/tracks/:trackId/vote")
  removeVote(@Param("id") id: string, @Param("trackId") trackId: string, @CurrentUser() user: User) {
    return this.playlistsService.removeVote(id, trackId, user);
  }

  @Get(":id/votes")
  votes(@Param("id") id: string) {
    return this.playlistsService.voteSummary(id);
  }
}
