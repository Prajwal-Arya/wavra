import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Playlist } from "../playlists/playlist.entity";
import { PlayHistory } from "../tracks/play-history.entity";
import { Track } from "../tracks/track.entity";
import { User } from "../users/user.entity";
import { Activity } from "./activity.entity";
import { Challenge } from "./challenge.entity";
import { Follow } from "./follow.entity";
import { PresenceGateway } from "./presence.gateway";
import { SocialController } from "./social.controller";
import { SocialService } from "./social.service";
import { UserBadge } from "./user-badge.entity";
import { UserChallenge } from "./user-challenge.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Follow, Activity, UserBadge, Challenge, UserChallenge, Track, Playlist, PlayHistory])],
  controllers: [SocialController],
  providers: [SocialService, PresenceGateway],
  exports: [SocialService, PresenceGateway]
})
export class SocialModule {}
