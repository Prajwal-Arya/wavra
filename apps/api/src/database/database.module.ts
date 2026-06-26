import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlaylistCollaborator } from "../modules/playlists/playlist-collaborator.entity";
import { PlaylistTrack } from "../modules/playlists/playlist-track.entity";
import { PlaylistVote } from "../modules/playlists/playlist-vote.entity";
import { Playlist } from "../modules/playlists/playlist.entity";
import { Activity } from "../modules/social/activity.entity";
import { Challenge } from "../modules/social/challenge.entity";
import { Follow } from "../modules/social/follow.entity";
import { UserBadge } from "../modules/social/user-badge.entity";
import { UserChallenge } from "../modules/social/user-challenge.entity";
import { PlayHistory } from "../modules/tracks/play-history.entity";
import { Track } from "../modules/tracks/track.entity";
import { TrackComment } from "../modules/tracks/track-comment.entity";
import { TrackReaction } from "../modules/tracks/track-reaction.entity";
import { User } from "../modules/users/user.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = process.env.DATABASE_URL;
        const base = {
          type: "postgres" as const,
          entities: [User, Track, Playlist, PlaylistTrack, PlaylistCollaborator, PlaylistVote, TrackReaction, TrackComment, PlayHistory, Follow, Activity, UserBadge, Challenge, UserChallenge],
          synchronize: true,
          ssl: url ? { rejectUnauthorized: false } : false,
        };
        if (url) return { ...base, url };
        return {
          ...base,
          host: config.get<string>("database.host"),
          port: config.get<number>("database.port"),
          username: config.get<string>("database.username"),
          password: config.get<string>("database.password"),
          database: config.get<string>("database.database"),
        };
      }
    })
  ]
})
export class DatabaseModule {}
