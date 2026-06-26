import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import configuration from "./config/configuration";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PlaylistsModule } from "./modules/playlists/playlists.module";
import { SearchModule } from "./modules/search/search.module";
import { SocialModule } from "./modules/social/social.module";
import { StorageModule } from "./modules/storage/storage.module";
import { TracksModule } from "./modules/tracks/tracks.module";
import { UsersModule } from "./modules/users/users.module";
import { SeedModule } from "./modules/seed/seed.module";
import { AppController } from "./app.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    TracksModule,
    PlaylistsModule,
    SearchModule,
    SocialModule,
    StorageModule,
    SeedModule
  ],
  controllers: [AppController]
})
export class AppModule {}
