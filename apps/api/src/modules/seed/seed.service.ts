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
  { url: "https://archive.org/download/kevin-macleod-royalty-free-music/Cipher.mp3",          title: "Cipher",             artist: "Kevin MacLeod", genre: "Electronic" },
  { url: "https://archive.org/download/kevin-macleod-royalty-free-music/Deliberate%20Thought.mp3", title: "Deliberate Thought", artist: "Kevin MacLeod", genre: "Ambient"    },
  { url: "https://archive.org/download/kevin-macleod-royalty-free-music/Chill.mp3",           title: "Chill",              artist: "Kevin MacLeod", genre: "Lo-fi"       },
  { url: "https://archive.org/download/kevin-macleod-royalty-free-music/Backed%20Vibes%20Clean.mp3", title: "Backed Vibes", artist: "Kevin MacLeod", genre: "Hip-Hop"    },
  { url: "https://archive.org/download/kevin-macleod-royalty-free-music/Perspectives.mp3",    title: "Perspectives",       artist: "Kevin MacLeod", genre: "Ambient"    },
  // ccMixter & Free Music Archive direct downloads (CC BY)
  { url: "https://archive.org/download/alans_gone/alans_gone.mp3",                            title: "Alan's Gone",        artist: "Siobhan Dakay", genre: "Indie"       },
  { url: "https://archive.org/download/cd_piano-music-for-the-people/01%20Piano%20Sonata%20No.%2016%20in%20C%20Major%2C%20K.%20545_%20I.%20Allegro.mp3", title: "Piano Sonata No.16 in C", artist: "Mozart", genre: "Classical" },
  { url: "https://archive.org/download/beethoven_opus18/Op18No1-01.mp3",                      title: "String Quartet Op.18", artist: "Beethoven",   genre: "Classical"  },
  { url: "https://archive.org/download/MusOpen-guitar/MusOpen-guitar.mp3",                    title: "Guitar Serenade",    artist: "MusOpen",       genre: "Acoustic"   },
  { url: "https://archive.org/download/SilenceOfCrickets/silence_of_crickets.mp3",            title: "Silence of Crickets", artist: "Josh Woodward", genre: "Ambient"   },
];

const SYSTEM_USER = {
  email: "library@soundnest.internal",
  username: "soundnest_library",
  displayName: "SoundNest Library",
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
