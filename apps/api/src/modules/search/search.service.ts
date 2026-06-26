import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, ILike, Repository } from "typeorm";
import { Playlist } from "../playlists/playlist.entity";
import { Track } from "../tracks/track.entity";
import { User } from "../users/user.entity";

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Track) private readonly tracks: Repository<Track>,
    @InjectRepository(Playlist) private readonly playlists: Repository<Playlist>,
    @InjectRepository(User) private readonly users: Repository<User>
  ) {}

  async search(q = "", type = "all", filters: { genre?: string; mood?: string } = {}) {
    const like = `%${q}%`;
    const [tracks, playlists, users] = await Promise.all([
      type === "all" || type === "track"
        ? this.searchTracks(q, filters)
        : [],
      type === "all" || type === "playlist" ? this.playlists.find({ where: { name: ILike(like), isPublic: true }, take: 20 }) : [],
      type === "all" || type === "user" ? this.users.find({ where: [{ username: ILike(like) }, { displayName: ILike(like) }], take: 20 }) : []
    ]);
    return { tracks, playlists, users };
  }

  private searchTracks(q: string, filters: { genre?: string; mood?: string }) {
    const query = this.tracks.createQueryBuilder("track").take(20);
    if (filters.genre) query.andWhere("track.genre = :genre", { genre: filters.genre });
    if (filters.mood) query.andWhere("track.mood = :mood", { mood: filters.mood });

    const trimmed = q.trim();
    if (!trimmed) {
      return query.orderBy("track.createdAt", "DESC").getMany();
    }

    query
      .andWhere(
        new Brackets((qb) => {
          qb.where(
            "to_tsvector('english', coalesce(track.title, '') || ' ' || coalesce(track.artist, '') || ' ' || coalesce(track.album, '') || ' ' || coalesce(track.genre, '')) @@ plainto_tsquery('english', :q)",
            { q: trimmed }
          ).orWhere("track.title ILIKE :like OR track.artist ILIKE :like OR track.album ILIKE :like OR track.genre ILIKE :like", { like: `%${trimmed}%` });
        })
      )
      .addSelect(
        "ts_rank(to_tsvector('english', coalesce(track.title, '') || ' ' || coalesce(track.artist, '') || ' ' || coalesce(track.album, '') || ' ' || coalesce(track.genre, '')), plainto_tsquery('english', :q))",
        "rank"
      )
      .orderBy("rank", "DESC")
      .addOrderBy("track.playCount", "DESC");

    return query.getMany();
  }
}
