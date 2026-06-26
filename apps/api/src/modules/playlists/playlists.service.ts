import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { randomBytes } from "crypto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Track } from "../tracks/track.entity";
import { User } from "../users/user.entity";
import { SocialService } from "../social/social.service";
import { CreatePlaylistDto } from "./dto/create-playlist.dto";
import { ReorderTracksDto } from "./dto/reorder-tracks.dto";
import { PlaylistCollaborator } from "./playlist-collaborator.entity";
import { PlaylistTrack } from "./playlist-track.entity";
import { PlaylistVote } from "./playlist-vote.entity";
import { Playlist } from "./playlist.entity";
import { PlaylistGateway } from "./playlist.gateway";

@Injectable()
export class PlaylistsService {
  constructor(
    @InjectRepository(Playlist) private readonly playlists: Repository<Playlist>,
    @InjectRepository(PlaylistTrack) private readonly playlistTracks: Repository<PlaylistTrack>,
    @InjectRepository(PlaylistCollaborator) private readonly collaborators: Repository<PlaylistCollaborator>,
    @InjectRepository(PlaylistVote) private readonly votes: Repository<PlaylistVote>,
    @InjectRepository(Track) private readonly tracks: Repository<Track>,
    private readonly gateway: PlaylistGateway,
    private readonly social: SocialService
  ) {}

  listPublic() {
    return this.playlists.find({ where: { isPublic: true }, relations: { owner: true }, order: { createdAt: "DESC" } });
  }

  async get(id: string) {
    const playlist = await this.playlists.findOne({
      where: { id },
      relations: { owner: true, playlistTracks: { track: true } },
      order: { playlistTracks: { position: "ASC" } }
    });
    if (!playlist) throw new NotFoundException("Playlist not found");
    return playlist;
  }

  async create(dto: CreatePlaylistDto, owner: User) {
    const playlist = await this.playlists.save(this.playlists.create({ ...dto, isPublic: dto.isPublic ?? true, isCollaborative: dto.isCollaborative ?? false, owner }));
    await this.social.onPlaylistCreated(owner, playlist);
    return playlist;
  }

  async aiGenerate(prompt: string, owner: User) {
    const words = prompt.toLowerCase().split(/\W+/).filter(Boolean);
    const tracks = await this.tracks.find({ order: { playCount: "DESC", createdAt: "DESC" }, take: 100 });
    const aiTrackIds = await this.getAiTrackIds(prompt, tracks);
    const scored = aiTrackIds.length
      ? aiTrackIds.map((id) => tracks.find((track) => track.id === id)).filter((track): track is Track => Boolean(track)).slice(0, 12)
      : tracks
      .map((track) => ({
        track,
        score: words.reduce((score, word) => {
          const haystack = `${track.title} ${track.artist} ${track.genre ?? ""} ${track.mood ?? ""}`.toLowerCase();
          return score + (haystack.includes(word) ? 2 : 0) + (track.mood?.toLowerCase() === word ? 3 : 0) + (track.genre?.toLowerCase() === word ? 3 : 0);
        }, track.playCount / 100)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map((item) => item.track);
    const playlist = await this.playlists.save(this.playlists.create({
      name: this.titleFromPrompt(prompt),
      description: `Generated from: ${prompt}`,
      isPublic: false,
      owner
    }));
    await Promise.all(scored.map((track, position) => this.playlistTracks.save(this.playlistTracks.create({ playlist, track, position }))));
    return this.get(playlist.id);
  }

  async dailyMixes(owner: User) {
    const existing = await this.playlists.find({ where: { owner: { id: owner.id }, isSystem: true }, relations: { playlistTracks: { track: true } }, order: { createdAt: "DESC" } });
    if (existing.length) return existing;
    const tracks = await this.tracks.find({ order: { playCount: "DESC", createdAt: "DESC" }, take: 30 });
    const groups = new Map<string, Track[]>();
    for (const track of tracks) {
      const key = track.genre ?? track.mood ?? "Fresh";
      groups.set(key, [...(groups.get(key) ?? []), track]);
    }
    const mixes: Playlist[] = [];
    for (const [genre, group] of [...groups.entries()].slice(0, 3)) {
      const playlist = await this.playlists.save(this.playlists.create({ name: `Daily Mix: ${genre}`, description: `A fresh ${genre} mix from your library.`, isPublic: false, isSystem: true, owner }));
      await Promise.all(group.slice(0, 10).map((track, position) => this.playlistTracks.save(this.playlistTracks.create({ playlist, track, position }))));
      mixes.push(await this.get(playlist.id));
    }
    return mixes;
  }

  async update(id: string, dto: Partial<CreatePlaylistDto>, owner: User) {
    const playlist = await this.get(id);
    this.assertOwner(playlist, owner);
    await this.playlists.update(id, dto);
    return this.get(id);
  }

  async remove(id: string, owner: User) {
    const playlist = await this.get(id);
    this.assertOwner(playlist, owner);
    await this.playlists.delete(id);
    return { id };
  }

  async addTrack(playlistId: string, trackId: string, owner: User) {
    const playlist = await this.get(playlistId);
    await this.assertCanEdit(playlist, owner);
    const track = await this.tracks.findOne({ where: { id: trackId } });
    if (!track) throw new NotFoundException("Track not found");
    const position = playlist.playlistTracks.length;
    await this.playlistTracks.save(this.playlistTracks.create({ playlist, track, position }));
    return this.emitAndReturn(playlistId);
  }

  async removeTrack(playlistId: string, trackId: string, owner: User) {
    const playlist = await this.get(playlistId);
    await this.assertCanEdit(playlist, owner);
    await this.playlistTracks.delete({ playlist: { id: playlistId }, track: { id: trackId } });
    return this.emitAndReturn(playlistId);
  }

  async reorder(playlistId: string, dto: ReorderTracksDto, owner: User) {
    const playlist = await this.get(playlistId);
    this.assertOwner(playlist, owner);
    await Promise.all(
      dto.orderedTrackIds.map((trackId, position) =>
        this.playlistTracks.update({ playlist: { id: playlistId }, track: { id: trackId } }, { position })
      )
    );
    return this.emitAndReturn(playlistId);
  }

  private assertOwner(playlist: Playlist, owner: User) {
    if (playlist.owner.id !== owner.id) throw new ForbiddenException("Only the owner can change this playlist");
  }

  private async assertCanEdit(playlist: Playlist, user: User) {
    if (playlist.owner.id === user.id) return;
    if (!playlist.isCollaborative) throw new ForbiddenException("Only the owner can change this playlist");
    const collaborator = await this.collaborators.findOne({ where: { playlist: { id: playlist.id }, user: { id: user.id } } });
    if (!collaborator || collaborator.role === "viewer") throw new ForbiddenException("You are not an editor on this playlist");
  }

  async invite(id: string, owner: User) {
    const playlist = await this.get(id);
    this.assertOwner(playlist, owner);
    const inviteCode = playlist.inviteCode ?? randomBytes(8).toString("hex").slice(0, 12);
    await this.playlists.update(id, { inviteCode, isCollaborative: true });
    this.gateway.playlistUpdated(id, { type: "invite", playlistId: id });
    return { inviteCode };
  }

  async join(inviteCode: string, user: User) {
    const playlist = await this.playlists.findOne({ where: { inviteCode }, relations: { owner: true } });
    if (!playlist) throw new NotFoundException("Invite not found");
    if (playlist.owner.id !== user.id) {
      const collaborator = await this.collaborators.findOne({ where: { playlist: { id: playlist.id }, user: { id: user.id } } });
      if (collaborator) {
        await this.collaborators.update(collaborator.id, { role: "editor" });
      } else {
        await this.collaborators.save(this.collaborators.create({ playlist, user, role: "editor" }));
      }
    }
    return this.emitAndReturn(playlist.id);
  }

  async listCollaborators(id: string) {
    await this.get(id);
    return this.collaborators.find({ where: { playlist: { id } }, relations: { user: true }, order: { joinedAt: "ASC" } });
  }

  async removeCollaborator(id: string, userId: string, owner: User) {
    const playlist = await this.get(id);
    this.assertOwner(playlist, owner);
    await this.collaborators.delete({ playlist: { id }, user: { id: userId } });
    this.gateway.playlistUpdated(id, { type: "collaborators", playlistId: id });
    return { userId };
  }

  async vote(playlistId: string, trackId: string, value: number, user: User) {
    if (![1, -1].includes(value)) throw new ForbiddenException("Vote must be 1 or -1");
    await this.get(playlistId);
    const playlistTrack = await this.playlistTracks.findOne({ where: { playlist: { id: playlistId }, track: { id: trackId } }, relations: { playlist: true, track: true } });
    if (!playlistTrack) throw new NotFoundException("Playlist track not found");
    const existingVote = await this.votes.findOne({ where: { playlistTrack: { id: playlistTrack.id }, user: { id: user.id } } });
    if (existingVote) {
      await this.votes.update(existingVote.id, { value });
    } else {
      await this.votes.save(this.votes.create({ playlistTrack, user, value }));
    }
    const summary = await this.voteSummary(playlistId);
    this.gateway.playlistUpdated(playlistId, { type: "votes", playlistId, votes: summary });
    return summary;
  }

  async removeVote(playlistId: string, trackId: string, user: User) {
    const playlistTrack = await this.playlistTracks.findOne({ where: { playlist: { id: playlistId }, track: { id: trackId } } });
    if (!playlistTrack) throw new NotFoundException("Playlist track not found");
    await this.votes.delete({ playlistTrack: { id: playlistTrack.id }, user: { id: user.id } });
    const summary = await this.voteSummary(playlistId);
    this.gateway.playlistUpdated(playlistId, { type: "votes", playlistId, votes: summary });
    return summary;
  }

  async voteSummary(playlistId: string) {
    const playlistTracks = await this.playlistTracks.find({ where: { playlist: { id: playlistId } }, relations: { track: true } });
    if (playlistTracks.length === 0) return [];
    const votes = await this.votes.find({ where: playlistTracks.map((playlistTrack) => ({ playlistTrack: { id: playlistTrack.id } })), relations: { playlistTrack: true } });
    return playlistTracks.map((playlistTrack) => ({
      trackId: playlistTrack.track.id,
      score: votes.filter((vote) => vote.playlistTrack.id === playlistTrack.id).reduce((sum, vote) => sum + vote.value, 0)
    }));
  }

  private async emitAndReturn(playlistId: string) {
    const playlist = await this.get(playlistId);
    this.gateway.playlistUpdated(playlistId, { type: "playlist", playlist });
    return playlist;
  }

  private titleFromPrompt(prompt: string) {
    const clean = prompt.replace(/[^\w\s]/g, "").trim().slice(0, 42);
    return clean ? `AI Mix: ${clean}` : "AI Mix";
  }

  private async getAiTrackIds(prompt: string, tracks: Track[]) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return [];
    try {
      const catalog = tracks.map((track) => ({ id: track.id, title: track.title, artist: track.artist, genre: track.genre, mood: track.mood })).slice(0, 80);
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
          max_tokens: 700,
          system: "Return only JSON in the shape {\"trackIds\":[\"...\"]}. Pick tracks from the provided catalog that match the user's playlist request.",
          messages: [{ role: "user", content: JSON.stringify({ prompt, catalog }) }]
        })
      });
      if (!response.ok) return [];
      const payload = await response.json() as { content?: Array<{ text?: string }> };
      const text = payload.content?.map((part) => part.text ?? "").join("\n") ?? "";
      const parsed = JSON.parse(text) as { trackIds?: string[] };
      return Array.isArray(parsed.trackIds) ? parsed.trackIds : [];
    } catch {
      return [];
    }
  }
}
