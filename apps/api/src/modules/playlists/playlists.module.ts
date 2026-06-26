import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SocialModule } from "../social/social.module";
import { Track } from "../tracks/track.entity";
import { PlaylistCollaborator } from "./playlist-collaborator.entity";
import { PlaylistTrack } from "./playlist-track.entity";
import { PlaylistVote } from "./playlist-vote.entity";
import { Playlist } from "./playlist.entity";
import { PlaylistGateway } from "./playlist.gateway";
import { PlaylistsController } from "./playlists.controller";
import { PlaylistsService } from "./playlists.service";

@Module({
  imports: [TypeOrmModule.forFeature([Playlist, PlaylistTrack, PlaylistCollaborator, PlaylistVote, Track]), SocialModule],
  controllers: [PlaylistsController],
  providers: [PlaylistsService, PlaylistGateway]
})
export class PlaylistsModule {}
