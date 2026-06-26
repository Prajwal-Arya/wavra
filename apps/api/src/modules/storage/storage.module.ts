import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TracksModule } from "../tracks/tracks.module";
import { LocalStorageService } from "./local-storage.service";
import { R2StorageService } from "./r2-storage.service";
import { StreamController } from "./stream.controller";
import { STORAGE } from "./storage.interface";

@Module({
  imports: [TracksModule],
  controllers: [StreamController],
  providers: [
    LocalStorageService,
    R2StorageService,
    {
      // Automatically pick R2 when all four env vars are present, else local disk
      provide: STORAGE,
      inject: [ConfigService, LocalStorageService, R2StorageService],
      useFactory: (
        config: ConfigService,
        local: LocalStorageService,
        r2: R2StorageService
      ) => {
        const hasR2 =
          config.get("R2_ACCOUNT_ID") &&
          config.get("R2_ACCESS_KEY_ID") &&
          config.get("R2_SECRET_ACCESS_KEY") &&
          config.get("R2_BUCKET");
        return hasR2 ? r2 : local;
      },
    },
  ],
  exports: [STORAGE, LocalStorageService, R2StorageService],
})
export class StorageModule {}
