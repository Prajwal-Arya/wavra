import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SocialModule } from "../social/social.module";
import { PlayHistory } from "./play-history.entity";
import { Track } from "./track.entity";
import { TrackComment } from "./track-comment.entity";
import { TrackReaction } from "./track-reaction.entity";
import { AudioAnalysisService } from "./audio-analysis.service";
import { LinkImportService } from "./link-import.service";
import { TracksController } from "./tracks.controller";
import { TracksService } from "./tracks.service";

@Module({
  imports: [TypeOrmModule.forFeature([Track, TrackReaction, TrackComment, PlayHistory]), SocialModule],
  controllers: [TracksController],
  providers: [TracksService, LinkImportService, AudioAnalysisService],
  exports: [TracksService]
})
export class TracksModule {}
