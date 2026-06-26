import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Track } from "../tracks/track.entity";
import { AudioAnalysisService } from "../tracks/audio-analysis.service";
import { LinkImportService } from "../tracks/link-import.service";
import { User } from "../users/user.entity";
import { SeedController } from "./seed.controller";
import { SeedService } from "./seed.service";

@Module({
  imports: [TypeOrmModule.forFeature([User, Track])],
  controllers: [SeedController],
  providers: [SeedService, LinkImportService, AudioAnalysisService],
})
export class SeedModule {}
