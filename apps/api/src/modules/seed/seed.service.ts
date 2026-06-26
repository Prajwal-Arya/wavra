import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../users/user.entity";
import { Track } from "../tracks/track.entity";
import { LinkImportService } from "../tracks/link-import.service";

// Curated royalty-free tracks from the Internet Archive (CC licensed).
// Each entry is a direct MP3 URL from archive.org — all CC BY or CC0.
const SEED_TRACKS = [
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",  title: "SoundHelix Song 1",  artist: "SoundHelix", genre: "Electronic" },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",  title: "SoundHelix Song 2",  artist: "SoundHelix", genre: "Ambient"    },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",  title: "SoundHelix Song 3",  artist: "SoundHelix", genre: "Lo-fi"      },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",  title: "SoundHelix Song 4",  artist: "SoundHelix", genre: "Hip-Hop"    },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",  title: "SoundHelix Song 5",  artist: "SoundHelix", genre: "Ambient"    },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",  title: "SoundHelix Song 6",  artist: "SoundHelix", genre: "Indie"      },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",  title: "SoundHelix Song 7",  artist: "SoundHelix", genre: "Classical"  },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",  title: "SoundHelix Song 8",  artist: "SoundHelix", genre: "Classical"  },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",  title: "SoundHelix Song 9",  artist: "SoundHelix", genre: "Acoustic"   },
  { url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", title: "SoundHelix Song 10", artist: "SoundHelix", genre: "Ambient"    },
];

const SYSTEM_USER = {
  email: "library@wavra.internal",
  username: "wavra_library",
  displayName: "Wavra Library",
  bio: "Official royalty-free music collection. All tracks are Creative Commons licensed.",
};

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Track) private readonly tracks: Repository<Track>,
    private readonly importer: LinkImportService,
  ) {}

  async seed(count = 10): Promise<{ imported: number; skipped: number; errors: string[] }> {
    const systemUser = await this.findOrCreateSystemUser();
    const existing = await this.tracks.count({ where: { uploader: { id: systemUser.id } } });
    if (existing >= count) {
      this.logger.log(`Library already has ${existing} seeded tracks — skipping.`);
      return { imported: 0, skipped: existing, errors: [] };
    }

    const toImport = SEED_TRACKS.slice(0, count);
    let imported = 0;
    const errors: string[] = [];

    for (const seed of toImport) {
      // Skip if a track with this source URL already exists
      const duplicate = await this.tracks.findOne({ where: { sourceUrl: seed.url } });
      if (duplicate) { errors.push(`Skipped duplicate: ${seed.title}`); continue; }

      try {
        this.logger.log(`Importing: ${seed.title} — ${seed.artist}`);
        const track = await this.importer.importDirect(seed.url, systemUser, {
          title: seed.title,
          artist: seed.artist,
          genre: seed.genre,
        });
        this.logger.log(`Imported track id=${track.id} "${track.title}"`);
        imported++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        this.logger.warn(`Failed to import "${seed.title}": ${msg}`);
        errors.push(`"${seed.title}": ${msg}`);
      }
    }

    return { imported, skipped: existing, errors };
  }

  private async findOrCreateSystemUser(): Promise<User> {
    const existing = await this.users.findOne({ where: { username: SYSTEM_USER.username } });
    if (existing) return existing;

    this.logger.log("Creating system library user...");
    const passwordHash = await bcrypt.hash(`system-${Date.now()}`, 10);
    return this.users.save(
      this.users.create({ ...SYSTEM_USER, passwordHash, isVerified: true })
    );
  }
}
