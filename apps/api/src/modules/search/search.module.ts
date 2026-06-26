import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Playlist } from "../playlists/playlist.entity";
import { Track } from "../tracks/track.entity";
import { User } from "../users/user.entity";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

@Module({
  imports: [TypeOrmModule.forFeature([Track, Playlist, User])],
  controllers: [SearchController],
  providers: [SearchService]
})
export class SearchModule {}
