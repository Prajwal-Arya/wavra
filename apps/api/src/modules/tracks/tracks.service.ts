import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, Repository } from "typeorm";
import { CreateTrackDto } from "./dto/create-track.dto";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateTrackDto } from "./dto/update-track.dto";
import { UpdateLyricsDto } from "./dto/update-lyrics.dto";
import { Track } from "./track.entity";
import { TrackComment } from "./track-comment.entity";
import { TrackReaction } from "./track-reaction.entity";
import { PlayHistory } from "./play-history.entity";
import { User } from "../users/user.entity";
import { CreateReactionDto } from "./dto/create-reaction.dto";
import { AudioAnalysisService } from "./audio-analysis.service";
import { SocialService } from "../social/social.service";

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track) private readonly tracks: Repository<Track>,
    @InjectRepository(TrackReaction) private readonly reactions: Repository<TrackReaction>,
    @InjectRepository(TrackComment) private readonly comments: Repository<TrackComment>,
    @InjectRepository(PlayHistory) private readonly playHistory: Repository<PlayHistory>,
    private readonly audioAnalysis: AudioAnalysisService,
    private readonly social: SocialService
  ) {}

  list(filters: { mood?: string; limit?: number } = {}) {
    const where: FindOptionsWhere<Track> = {};
    if (filters.mood) where.mood = filters.mood;
    where.isPublished = true;
    return this.tracks.find({
      where,
      relations: { uploader: true },
      order: { createdAt: "DESC" },
      take: filters.limit ?? 50
    });
  }

  async get(id: string) {
    const track = await this.tracks.findOne({ where: { id }, relations: { uploader: true } });
    if (!track) throw new NotFoundException("Track not found");
    return track;
  }

  async create(dto: CreateTrackDto, file: Express.Multer.File, uploader: User) {
    if (!file) throw new BadRequestException("Audio file is required");
    const analysis = await this.audioAnalysis.analyze(file.path);
    const scheduledReleaseAt = dto.scheduledReleaseAt ? new Date(dto.scheduledReleaseAt) : undefined;

    // Auto-tag genre/mood from BPM + energy when user didn't provide them
    const autoTags = this.audioAnalysis.autoTag(analysis.bpm, analysis.waveformData);
    const genre = dto.genre ?? analysis.genre ?? autoTags.genre;
    const mood = dto.mood ?? autoTags.mood;

    const track = this.tracks.create({
      title: dto.title ?? analysis.title ?? file.originalname,
      artist: dto.artist ?? analysis.artist ?? uploader.displayName ?? uploader.username,
      album: dto.album ?? analysis.album,
      genre,
      mood,
      bpm: analysis.bpm,
      durationSeconds: analysis.durationSeconds,
      filePath: file.path,
      fileSizeBytes: file.size,
      mimeType: file.mimetype,
      waveformData: analysis.waveformData,
      scheduledReleaseAt,
      isPublished: scheduledReleaseAt ? scheduledReleaseAt <= new Date() : dto.isPublished !== "false",
      uploader
    });
    const saved = await this.tracks.save(track);
    await this.social.onTrackUploaded(uploader, saved);
    return saved;
  }

  async update(id: string, dto: UpdateTrackDto, user: User) {
    const track = await this.get(id);
    if (track.uploader.id !== user.id) throw new ForbiddenException("Only the uploader can update this track");
    const scheduledReleaseAt = dto.scheduledReleaseAt ? new Date(dto.scheduledReleaseAt) : undefined;
    await this.tracks.update(id, { ...dto, scheduledReleaseAt, isPublished: dto.isPublished === undefined ? undefined : dto.isPublished !== "false" });
    return this.get(id);
  }

  async remove(id: string, user: User) {
    const track = await this.get(id);
    if (track.uploader.id !== user.id) throw new ForbiddenException("Only the uploader can delete this track");
    await this.tracks.delete(id);
    return { id };
  }

  async recordPlay(id: string, user?: User) {
    const track = await this.get(id);
    await this.tracks.increment({ id }, "playCount", 1);
    await this.playHistory.save(this.playHistory.create({ track, user }));
    await this.social.onTrackPlayed(user, track);
    return this.get(id);
  }

  async addReaction(trackId: string, dto: CreateReactionDto, user: User) {
    const track = await this.get(trackId);
    return this.reactions.save(this.reactions.create({ track, user, emoji: dto.emoji, timestamp: dto.timestamp }));
  }

  async listReactions(trackId: string) {
    await this.get(trackId);
    const reactions = await this.reactions.find({ where: { track: { id: trackId } }, relations: { user: true }, order: { timestamp: "ASC" } });
    return reactions.map((reaction) => ({
      id: reaction.id,
      emoji: reaction.emoji,
      timestamp: reaction.timestamp,
      user: reaction.user ? { id: reaction.user.id, username: reaction.user.username, displayName: reaction.user.displayName } : null
    }));
  }

  async removeReaction(trackId: string, reactionId: string, user: User) {
    const reaction = await this.reactions.findOne({ where: { id: reactionId, track: { id: trackId } }, relations: { user: true } });
    if (!reaction) throw new NotFoundException("Reaction not found");
    if (reaction.user.id !== user.id) throw new ForbiddenException("Only the reaction owner can remove it");
    await this.reactions.delete(reaction.id);
    return { id: reaction.id };
  }

  async getLyrics(trackId: string) {
    const track = await this.get(trackId);
    return { lyrics: track.lyrics ?? "", lyricsSynced: track.lyricsSynced };
  }

  async updateLyrics(trackId: string, dto: UpdateLyricsDto, user: User) {
    const track = await this.get(trackId);
    if (track.uploader.id !== user.id) throw new ForbiddenException("Only the uploader can update lyrics");
    await this.tracks.update(trackId, { lyrics: dto.lyrics, lyricsSynced: dto.lyricsSynced ?? false });
    return this.getLyrics(trackId);
  }

  async listComments(trackId: string) {
    await this.get(trackId);
    const comments = await this.comments.find({
      where: { track: { id: trackId } },
      relations: { user: true, parent: true },
      order: { createdAt: "ASC" }
    });
    return comments.map((comment) => this.toPublicComment(comment));
  }

  async addComment(trackId: string, dto: CreateCommentDto, user: User) {
    const track = await this.get(trackId);
    const parent = dto.parentId ? await this.comments.findOne({ where: { id: dto.parentId, track: { id: trackId } } }) : null;
    if (dto.parentId && !parent) throw new NotFoundException("Parent comment not found");
    const comment = await this.comments.save(this.comments.create({ track, user, parent, content: dto.content.trim() }));
    return this.toPublicComment({ ...comment, user, parent });
  }

  async removeComment(trackId: string, commentId: string, user: User) {
    const comment = await this.comments.findOne({ where: { id: commentId, track: { id: trackId } }, relations: { user: true } });
    if (!comment) throw new NotFoundException("Comment not found");
    if (comment.user.id !== user.id) throw new ForbiddenException("Only the comment owner can remove it");
    await this.comments.delete(comment.id);
    return { id: comment.id };
  }

  async recommendations(user?: User, limit = 20) {
    if (!user) {
      return this.tracks.find({ order: { playCount: "DESC", createdAt: "DESC" }, take: limit });
    }

    const history = await this.playHistory.find({ where: { user: { id: user.id } }, relations: { track: true }, take: 50, order: { playedAt: "DESC" } });
    const genres = [...new Set(history.map((row) => row.track.genre).filter(Boolean))];
    const moods = [...new Set(history.map((row) => row.track.mood).filter(Boolean))];
    const artists = [...new Set(history.map((row) => row.track.artist).filter(Boolean))];

    const query = this.tracks.createQueryBuilder("track").take(limit).orderBy("track.playCount", "DESC").addOrderBy("track.createdAt", "DESC");
    if (genres.length || moods.length || artists.length) {
      query.where("track.genre IN (:...genres)", { genres: genres.length ? genres : ["__none__"] })
        .orWhere("track.mood IN (:...moods)", { moods: moods.length ? moods : ["__none__"] })
        .orWhere("track.artist IN (:...artists)", { artists: artists.length ? artists : ["__none__"] });
    }
    return query.getMany();
  }

  private toPublicComment(comment: TrackComment) {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      parentId: comment.parent?.id ?? null,
      user: comment.user ? { id: comment.user.id, username: comment.user.username, displayName: comment.user.displayName } : null
    };
  }
}
