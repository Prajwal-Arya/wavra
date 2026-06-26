import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Playlist } from "../playlists/playlist.entity";
import { PlayHistory } from "../tracks/play-history.entity";
import { Track } from "../tracks/track.entity";
import { User } from "../users/user.entity";
import { Activity } from "./activity.entity";
import { Challenge } from "./challenge.entity";
import { Follow } from "./follow.entity";
import { UserBadge } from "./user-badge.entity";
import { UserChallenge } from "./user-challenge.entity";

const badgeCatalog = [
  { type: "first_upload", label: "First Upload", description: "Upload your first track" },
  { type: "playlist_curator", label: "Playlist Curator", description: "Create 5 playlists" },
  { type: "century_club", label: "Century Club", description: "Play 100 tracks" },
  { type: "night_owl", label: "Night Owl", description: "Listen between midnight and 4am" },
  { type: "genre_explorer", label: "Genre Explorer", description: "Listen to 10 genres" },
  { type: "social_butterfly", label: "Social Butterfly", description: "Get 10 followers" },
  { type: "collaborator", label: "Collaborator", description: "Join collaborative playlists" }
];

@Injectable()
export class SocialService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Follow) private readonly follows: Repository<Follow>,
    @InjectRepository(Activity) private readonly activities: Repository<Activity>,
    @InjectRepository(UserBadge) private readonly badges: Repository<UserBadge>,
    @InjectRepository(Challenge) private readonly challenges: Repository<Challenge>,
    @InjectRepository(UserChallenge) private readonly userChallenges: Repository<UserChallenge>,
    @InjectRepository(Track) private readonly tracks: Repository<Track>,
    @InjectRepository(Playlist) private readonly playlists: Repository<Playlist>,
    @InjectRepository(PlayHistory) private readonly playHistory: Repository<PlayHistory>
  ) {}

  async follow(targetId: string, user: User) {
    if (targetId === user.id) throw new BadRequestException("You cannot follow yourself");
    const target = await this.users.findOne({ where: { id: targetId } });
    if (!target) throw new NotFoundException("User not found");
    const existing = await this.follows.findOne({ where: { follower: { id: user.id }, following: { id: targetId } } });
    if (!existing) {
      await this.follows.save(this.follows.create({ follower: user, following: target }));
      await this.users.increment({ id: targetId }, "followersCount", 1);
      await this.users.increment({ id: user.id }, "followingCount", 1);
      await this.recordActivity(user, "follow", "user", targetId, { username: target.username });
      if (target.followersCount + 1 >= 10) await this.awardBadge(target, "social_butterfly");
    }
    return { following: true };
  }

  async unfollow(targetId: string, user: User) {
    const existing = await this.follows.findOne({ where: { follower: { id: user.id }, following: { id: targetId } } });
    if (existing) {
      await this.follows.delete(existing.id);
      await this.users.decrement({ id: targetId }, "followersCount", 1);
      await this.users.decrement({ id: user.id }, "followingCount", 1);
    }
    return { following: false };
  }

  followers(userId: string) {
    return this.follows.find({ where: { following: { id: userId } }, relations: { follower: true }, order: { createdAt: "DESC" } });
  }

  following(userId: string) {
    return this.follows.find({ where: { follower: { id: userId } }, relations: { following: true }, order: { createdAt: "DESC" } });
  }

  async feed(user: User, limit = 30) {
    const follows = await this.follows.find({ where: { follower: { id: user.id } }, relations: { following: true } });
    const ids = follows.map((follow) => follow.following.id);
    if (!ids.length) return [];
    return this.activities.createQueryBuilder("activity")
      .leftJoinAndSelect("activity.user", "user")
      .where("user.id IN (:...ids)", { ids })
      .orderBy("activity.createdAt", "DESC")
      .take(limit)
      .getMany();
  }

  badgesCatalog() {
    return badgeCatalog;
  }

  userBadges(userId: string) {
    return this.badges.find({ where: { user: { id: userId } }, order: { earnedAt: "DESC" } });
  }

  async awardBadge(user: User, badgeType: string) {
    const known = badgeCatalog.some((badge) => badge.type === badgeType);
    if (!known) throw new BadRequestException("Unknown badge");
    const existing = await this.badges.findOne({ where: { user: { id: user.id }, badgeType } });
    if (existing) return existing;
    return this.badges.save(this.badges.create({ user, badgeType }));
  }

  async verifyUser(userId: string, actor: User) {
    const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((item) => item.trim()).filter(Boolean);
    if (!admins.includes(actor.email) && actor.username !== "admin") {
      throw new ForbiddenException("Only admins can verify artists");
    }
    await this.users.update(userId, { isVerified: true });
    return this.users.findOne({ where: { id: userId } });
  }

  async onTrackUploaded(user: User, track: Track) {
    await this.recordActivity(user, "upload", "track", track.id, { title: track.title });
    const uploads = await this.tracks.count({ where: { uploader: { id: user.id } } });
    if (uploads >= 1) await this.awardBadge(user, "first_upload");
  }

  async onPlaylistCreated(user: User, playlist: Playlist) {
    await this.recordActivity(user, "playlist_create", "playlist", playlist.id, { name: playlist.name });
    const count = await this.playlists.count({ where: { owner: { id: user.id } } });
    if (count >= 5) await this.awardBadge(user, "playlist_curator");
  }

  async onTrackPlayed(user: User | undefined, track: Track) {
    if (!user) return;
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const previous = await this.users.findOne({ where: { id: user.id } });
    if (previous?.lastListenedDate !== today) {
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const nextStreak = previous?.lastListenedDate === yesterday ? (previous.currentStreak ?? 0) + 1 : 1;
      await this.users.update(user.id, { lastListenedDate: today, currentStreak: nextStreak, longestStreak: Math.max(previous?.longestStreak ?? 0, nextStreak) });
    }
    const plays = await this.playHistory.count({ where: { user: { id: user.id } } });
    if (plays >= 100) await this.awardBadge(user, "century_club");
    if (now.getHours() < 4) await this.awardBadge(user, "night_owl");
    const genres = await this.playHistory.find({ where: { user: { id: user.id } }, relations: { track: true } });
    if (new Set(genres.map((row) => row.track.genre).filter(Boolean)).size >= 10) await this.awardBadge(user, "genre_explorer");
    await this.incrementChallenge(user, "tracks", 1);
    if (track.genre) await this.incrementChallenge(user, "genres", 1);
  }

  async leaderboards(type = "trending_tracks", limit = 20) {
    if (type === "top_uploaders") {
      return this.users.createQueryBuilder("user")
        .leftJoin("user.tracks", "track")
        .select(["user.id", "user.username", "user.displayName", "user.avatarPath", "user.isVerified"])
        .addSelect("COUNT(track.id)", "score")
        .groupBy("user.id")
        .orderBy("score", "DESC")
        .take(limit)
        .getRawMany();
    }
    if (type === "top_listeners") {
      return this.playHistory.createQueryBuilder("history")
        .leftJoin("history.user", "user")
        .select(["user.id AS id", "user.username AS username", "user.displayName AS displayName"])
        .addSelect("COUNT(history.id)", "score")
        .groupBy("user.id")
        .orderBy("score", "DESC")
        .take(limit)
        .getRawMany();
    }
    return this.tracks.find({ order: { playCount: "DESC", createdAt: "DESC" }, take: limit, relations: { uploader: true } });
  }

  async analytics(user: User) {
    const tracks = await this.tracks.find({ where: { uploader: { id: user.id } } });
    const totalPlays = tracks.reduce((sum, track) => sum + track.playCount, 0);
    return {
      totalTracks: tracks.length,
      totalPlays,
      averagePlays: tracks.length ? Math.round(totalPlays / tracks.length) : 0,
      topTrack: [...tracks].sort((a, b) => b.playCount - a.playCount)[0] ?? null
    };
  }

  async trackAnalytics(user: User) {
    return this.tracks.find({ where: { uploader: { id: user.id } }, order: { playCount: "DESC" } });
  }

  async activeChallenges(user: User) {
    await this.ensureDefaultChallenges();
    const challenges = await this.challenges.find({ order: { endsAt: "ASC" } });
    const rows = await Promise.all(challenges.map(async (challenge) => {
      let row = await this.userChallenges.findOne({ where: { user: { id: user.id }, challenge: { id: challenge.id } }, relations: { challenge: true } });
      if (!row) row = await this.userChallenges.save(this.userChallenges.create({ user, challenge, progress: 0, completed: false }));
      return row;
    }));
    return rows;
  }

  async incrementChallenge(user: User, metric: Challenge["metric"], amount: number) {
    await this.ensureDefaultChallenges();
    const challenges = await this.challenges.find({ where: { metric } });
    for (const challenge of challenges) {
      let row = await this.userChallenges.findOne({ where: { user: { id: user.id }, challenge: { id: challenge.id } }, relations: { challenge: true } });
      if (!row) row = await this.userChallenges.save(this.userChallenges.create({ user, challenge, progress: 0, completed: false }));
      if (row.completed) continue;
      const progress = Math.min(challenge.targetValue, row.progress + amount);
      await this.userChallenges.update(row.id, { progress, completed: progress >= challenge.targetValue, completedAt: progress >= challenge.targetValue ? new Date() : undefined });
    }
  }

  async recordActivity(user: User, type: Activity["type"], targetType: Activity["targetType"], targetId: string, metadata?: Record<string, unknown>) {
    return this.activities.save(this.activities.create({ user, type, targetType, targetId, metadata }));
  }

  private async ensureDefaultChallenges() {
    const count = await this.challenges.count();
    if (count) return;
    const now = new Date();
    const week = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await this.challenges.save([
      this.challenges.create({ title: "Fresh Finds", description: "Play 10 tracks this week", type: "weekly", targetValue: 10, metric: "tracks", startsAt: now, endsAt: week }),
      this.challenges.create({ title: "Genre Explorer", description: "Listen across 5 genres", type: "weekly", targetValue: 5, metric: "genres", startsAt: now, endsAt: week })
    ]);
  }
}
