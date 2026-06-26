import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { User } from "../users/user.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CreateTrackDto } from "./dto/create-track.dto";
import { CreateReactionDto } from "./dto/create-reaction.dto";
import { ImportTrackDto } from "./dto/import-track.dto";
import { UpdateTrackDto } from "./dto/update-track.dto";
import { UpdateLyricsDto } from "./dto/update-lyrics.dto";
import { LinkImportService } from "./link-import.service";
import { TracksService } from "./tracks.service";

@Controller("tracks")
export class TracksController {
  constructor(
    private readonly tracksService: TracksService,
    private readonly linkImportService: LinkImportService
  ) {}

  @Get()
  list(@Query("mood") mood?: string, @Query("limit") limit?: string) {
    return this.tracksService.list({ mood, limit: limit ? Number(limit) : undefined });
  }

  @Get("recommendations")
  recommendations(@Query("limit") limit?: string, @CurrentUser() user?: User) {
    return this.tracksService.recommendations(user, limit ? Number(limit) : 20);
  }

  @UseGuards(JwtAuthGuard)
  @Post("import")
  importFromLink(@Body() dto: ImportTrackDto, @CurrentUser() user: User) {
    return this.linkImportService.import(dto.url, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor("file", { storage: diskStorage({ destination: "apps/api/uploads/audio" }) }))
  create(@Body() dto: CreateTrackDto, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: User) {
    return this.tracksService.create(dto, file, user);
  }

  @Get(":id/lyrics")
  lyrics(@Param("id") id: string) {
    return this.tracksService.getLyrics(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id/lyrics")
  updateLyrics(@Param("id") id: string, @Body() dto: UpdateLyricsDto, @CurrentUser() user: User) {
    return this.tracksService.updateLyrics(id, dto, user);
  }

  @Get(":id/comments")
  comments(@Param("id") id: string) {
    return this.tracksService.listComments(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/comments")
  addComment(@Param("id") id: string, @Body() dto: CreateCommentDto, @CurrentUser() user: User) {
    return this.tracksService.addComment(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id/comments/:commentId")
  removeComment(@Param("id") id: string, @Param("commentId") commentId: string, @CurrentUser() user: User) {
    return this.tracksService.removeComment(id, commentId, user);
  }

  @Get(":id")
  get(@Param("id") id: string) {
    return this.tracksService.get(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTrackDto, @CurrentUser() user: User) {
    return this.tracksService.update(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string, @CurrentUser() user: User) {
    return this.tracksService.remove(id, user);
  }

  @Post(":id/play")
  recordPlay(@Param("id") id: string, @CurrentUser() user?: User) {
    return this.tracksService.recordPlay(id, user);
  }

  @Get(":id/reactions")
  reactions(@Param("id") id: string) {
    return this.tracksService.listReactions(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(":id/reactions")
  addReaction(@Param("id") id: string, @Body() dto: CreateReactionDto, @CurrentUser() user: User) {
    return this.tracksService.addReaction(id, dto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id/reactions/:reactionId")
  removeReaction(@Param("id") id: string, @Param("reactionId") reactionId: string, @CurrentUser() user: User) {
    return this.tracksService.removeReaction(id, reactionId, user);
  }
}
