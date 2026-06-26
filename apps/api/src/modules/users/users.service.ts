import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Playlist } from "../playlists/playlist.entity";
import { PlayHistory } from "../tracks/play-history.entity";
import { Track } from "../tracks/track.entity";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { User } from "./user.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Track) private readonly tracks: Repository<Track>,
    @InjectRepository(Playlist) private readonly playlists: Repository<Playlist>,
    @InjectRepository(PlayHistory) private readonly playHistory: Repository<PlayHistory>
  ) {}

  findByEmail(email: string) {
    return this.users.findOne({ where: { email } });
  }

  findByUsername(username: string) {
    return this.users.findOne({ where: { username } });
  }

  findById(id: string) {
    return this.users.findOne({ where: { id } });
  }

  async getPublicProfile(id: string) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return this.toPublicUser(user);
  }

  async updateProfile(user: User, dto: UpdateProfileDto) {
    await this.users.update(user.id, dto);
    return this.getPublicProfile(user.id);
  }

  async updateAvatar(user: User, file: Express.Multer.File) {
    if (!file) throw new NotFoundException("Avatar file not found");
    await this.users.update(user.id, { avatarPath: file.path });
    return this.getPublicProfile(user.id);
  }

  tracksByUser(id: string) {
    return this.tracks.find({ where: { uploader: { id }, isPublished: true }, order: { createdAt: "DESC" } });
  }

  upcomingByUser(id: string) {
    return this.tracks.find({ where: { uploader: { id }, isPublished: false }, order: { scheduledReleaseAt: "ASC" } });
  }

  playlistsByUser(id: string) {
    return this.playlists.find({ where: { owner: { id }, isPublic: true }, order: { createdAt: "DESC" } });
  }

  async getStats(user: User) {
    const rows = await this.playHistory.find({ where: { user: { id: user.id } }, relations: { track: true }, order: { playedAt: "DESC" } });
    const genreCounts = new Map<string, number>();
    const trackCounts = new Map<string, { track: Track; playCount: number }>();
    for (const row of rows) {
      const genre = row.track.genre ?? "Unknown";
      genreCounts.set(genre, (genreCounts.get(genre) ?? 0) + 1);
      const existing = trackCounts.get(row.track.id);
      trackCounts.set(row.track.id, { track: row.track, playCount: (existing?.playCount ?? 0) + 1 });
    }
    const total = rows.length;
    const topTrack = [...trackCounts.values()].sort((a, b) => b.playCount - a.playCount)[0] ?? null;
    const topGenre = [...genreCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    return {
      totalListeningMinutes: total * 3,
      totalTracksPlayed: total,
      uniqueTracksPlayed: trackCounts.size,
      currentStreak: total ? 1 : 0,
      longestStreak: total ? 1 : 0,
      topTrack,
      topGenre,
      peakHour: rows[0]?.playedAt?.getHours() ?? null,
      averageDailyMinutes: total ? 3 : 0,
      genreDistribution: [...genreCounts.entries()].map(([genre, count]) => ({ genre, percentage: Math.round((count / Math.max(total, 1)) * 100) }))
    };
  }

  async topTracks(user: User, limit = 10) {
    const stats = await this.getStats(user);
    if (!stats.topTrack) return [];
    const rows = await this.playHistory.find({ where: { user: { id: user.id } }, relations: { track: true } });
    const counts = new Map<string, { track: Track; playCount: number }>();
    for (const row of rows) {
      const existing = counts.get(row.track.id);
      counts.set(row.track.id, { track: row.track, playCount: (existing?.playCount ?? 0) + 1 });
    }
    return [...counts.values()].sort((a, b) => b.playCount - a.playCount).slice(0, limit);
  }

  async analytics(user: User) {
    const tracks = await this.tracks.find({ where: { uploader: { id: user.id } }, order: { playCount: "DESC" } });
    const totalPlays = tracks.reduce((sum, track) => sum + track.playCount, 0);
    return {
      totalTracks: tracks.length,
      totalPlays,
      averagePlays: tracks.length ? Math.round(totalPlays / tracks.length) : 0,
      topTrack: tracks[0] ?? null
    };
  }

  trackAnalytics(user: User) {
    return this.tracks.find({ where: { uploader: { id: user.id } }, order: { playCount: "DESC" } });
  }

  create(input: Pick<User, "email" | "username" | "passwordHash" | "displayName">) {
    return this.users.save(this.users.create(input));
  }

  toPublicUser(user: User) {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }
}
