export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  bio?: string;
  avatarPath?: string;
  followersCount?: number;
  followingCount?: number;
  isVerified?: boolean;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  mood?: string;
  durationSeconds: number;
  coverPath?: string;
  sourceUrl?: string;
  sourcePlatform?: string;
  waveformData?: number[];
  lyrics?: string;
  lyricsSynced?: boolean;
  bpm?: number;
  scheduledReleaseAt?: string;
  isPublished?: boolean;
  playCount: number;
  uploader?: User;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverPath?: string;
  isPublic: boolean;
  isCollaborative?: boolean;
  inviteCode?: string;
  tracks?: Track[];
  playlistTracks?: Array<{ id: string; position: number; track: Track }>;
  owner?: User;
}

export interface TrackReaction {
  id: string;
  emoji: string;
  timestamp: number;
  user?: Pick<User, "id" | "username" | "displayName"> | null;
}

export interface TrackComment {
  id: string;
  content: string;
  createdAt: string;
  parentId?: string | null;
  user?: Pick<User, "id" | "username" | "displayName"> | null;
}

export interface Activity {
  id: string;
  type: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  user?: User;
}

export interface UserBadge {
  id: string;
  badgeType: string;
  earnedAt: string;
}
