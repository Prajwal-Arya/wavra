# Music Streaming Platform — Architecture & Design Document

## Overview

A full-stack music streaming platform that allows users to upload, stream, discover, and organize music. Built with a modern TypeScript stack featuring a Next.js frontend, NestJS backend, and PostgreSQL database.

---

## Tech Stack

| Layer          | Technology                              |
|----------------|----------------------------------------|
| Frontend       | Next.js 14 (App Router, TypeScript)     |
| Styling        | Tailwind CSS (dark theme)               |
| State Mgmt     | Zustand                                 |
| Backend        | NestJS (TypeScript)                     |
| Database       | PostgreSQL 13                           |
| ORM            | TypeORM                                 |
| Auth           | JWT (passport-jwt + bcrypt)             |
| File Storage   | Local filesystem (S3-swappable)         |
| Containerization | Docker (PostgreSQL)                   |

---

## Project Structure

```
music_player/
├── package.json                     # npm workspaces: ["apps/*"]
├── docker-compose.yml               # PostgreSQL 13 service
├── .env.example
│
├── apps/
│   ├── web/                         # ── Next.js Frontend ──
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── src/
│   │       ├── app/                 # App Router pages
│   │       │   ├── layout.tsx       # Root layout (Sidebar + TopBar + PlayerBar shell)
│   │       │   ├── page.tsx         # Home — Recently Uploaded, Most Played, Genre Browse
│   │       │   ├── globals.css
│   │       │   ├── (auth)/
│   │       │   │   ├── login/page.tsx
│   │       │   │   └── signup/page.tsx
│   │       │   ├── profile/
│   │       │   │   └── [userId]/page.tsx
│   │       │   ├── upload/page.tsx
│   │       │   ├── search/page.tsx
│   │       │   ├── playlist/
│   │       │   │   ├── page.tsx              # My Playlists
│   │       │   │   └── [playlistId]/page.tsx  # Playlist Detail
│   │       │   └── track/
│   │       │       └── [trackId]/page.tsx
│   │       │
│   │       ├── components/
│   │       │   ├── layout/
│   │       │   │   ├── Sidebar.tsx           # Fixed left nav + playlist list
│   │       │   │   ├── TopBar.tsx            # Search bar + user avatar
│   │       │   │   └── PlayerBar.tsx         # Persistent bottom audio player
│   │       │   ├── player/
│   │       │   │   ├── AudioPlayer.tsx       # Core <audio> + Web Audio API
│   │       │   │   ├── Waveform.tsx          # Canvas waveform visualization
│   │       │   │   ├── ProgressBar.tsx       # Seek bar
│   │       │   │   ├── VolumeControl.tsx
│   │       │   │   └── QueueDrawer.tsx       # Slide-out play queue
│   │       │   ├── track/
│   │       │   │   ├── TrackCard.tsx         # Grid card (cover art + title)
│   │       │   │   ├── TrackRow.tsx          # List row (table-style)
│   │       │   │   └── UploadForm.tsx        # Drag-drop upload with metadata
│   │       │   ├── playlist/
│   │       │   │   ├── PlaylistCard.tsx
│   │       │   │   ├── PlaylistEditor.tsx    # Create/edit modal
│   │       │   │   └── SortableTrackList.tsx # Drag-to-reorder tracks
│   │       │   ├── search/
│   │       │   │   ├── SearchInput.tsx       # Debounced search field
│   │       │   │   └── SearchResults.tsx     # Tabbed results (tracks/playlists/users)
│   │       │   ├── auth/
│   │       │   │   ├── LoginForm.tsx
│   │       │   │   └── SignupForm.tsx
│   │       │   └── ui/                       # Shared primitives
│   │       │       ├── Button.tsx
│   │       │       ├── Input.tsx
│   │       │       ├── Modal.tsx
│   │       │       ├── Avatar.tsx
│   │       │       └── Skeleton.tsx
│   │       │
│   │       ├── hooks/
│   │       │   ├── usePlayer.ts             # Player actions shorthand
│   │       │   ├── useQueue.ts              # Queue management
│   │       │   ├── useAuth.ts               # Auth state + actions
│   │       │   └── useDebounce.ts           # Debounced value hook
│   │       │
│   │       ├── stores/
│   │       │   ├── playerStore.ts           # Zustand — playback state, queue, shuffle, repeat
│   │       │   └── authStore.ts             # Zustand — user, token, login/logout
│   │       │
│   │       ├── lib/
│   │       │   ├── api.ts                   # Axios instance with JWT interceptor
│   │       │   ├── auth.ts                  # Token helpers (get/set/remove)
│   │       │   └── utils.ts                 # Format duration, classnames, etc.
│   │       │
│   │       └── types/
│   │           └── index.ts                 # Shared TypeScript interfaces
│   │
│   └── api/                         # ── NestJS Backend ──
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── src/
│           ├── main.ts                      # Bootstrap, CORS, port 3001
│           ├── app.module.ts                # Root module
│           │
│           ├── config/
│           │   └── configuration.ts         # Environment config
│           │
│           ├── common/
│           │   ├── guards/
│           │   │   └── jwt-auth.guard.ts    # Passport JWT guard
│           │   ├── decorators/
│           │   │   └── current-user.decorator.ts  # @CurrentUser() param decorator
│           │   ├── interceptors/
│           │   │   └── transform.interceptor.ts   # Wrap responses in { data }
│           │   └── filters/
│           │       └── http-exception.filter.ts
│           │
│           ├── modules/
│           │   ├── auth/
│           │   │   ├── auth.module.ts
│           │   │   ├── auth.controller.ts   # POST /signup, /login, GET /me
│           │   │   ├── auth.service.ts      # Hash passwords, issue JWTs
│           │   │   ├── jwt.strategy.ts      # Validate JWT, attach user to request
│           │   │   └── dto/
│           │   │       ├── login.dto.ts
│           │   │       └── signup.dto.ts
│           │   │
│           │   ├── users/
│           │   │   ├── users.module.ts
│           │   │   ├── users.controller.ts  # GET /:id, PATCH /me, avatar upload
│           │   │   ├── users.service.ts
│           │   │   ├── user.entity.ts       # TypeORM entity
│           │   │   └── dto/
│           │   │       └── update-profile.dto.ts
│           │   │
│           │   ├── tracks/
│           │   │   ├── tracks.module.ts
│           │   │   ├── tracks.controller.ts # POST / (upload), GET, PATCH, DELETE
│           │   │   ├── tracks.service.ts    # Metadata extraction, waveform computation
│           │   │   ├── track.entity.ts
│           │   │   └── dto/
│           │   │       ├── create-track.dto.ts
│           │   │       └── update-track.dto.ts
│           │   │
│           │   ├── playlists/
│           │   │   ├── playlists.module.ts
│           │   │   ├── playlists.controller.ts  # Full CRUD + track management
│           │   │   ├── playlists.service.ts
│           │   │   ├── playlist.entity.ts
│           │   │   ├── playlist-track.entity.ts
│           │   │   └── dto/
│           │   │       ├── create-playlist.dto.ts
│           │   │       └── reorder-tracks.dto.ts
│           │   │
│           │   ├── search/
│           │   │   ├── search.module.ts
│           │   │   ├── search.controller.ts # GET /search?q=&type=&genre=
│           │   │   └── search.service.ts    # PostgreSQL full-text search
│           │   │
│           │   └── storage/
│           │       ├── storage.module.ts
│           │       ├── storage.interface.ts     # IStorageProvider (swap local for S3)
│           │       ├── local-storage.service.ts # fs-based implementation
│           │       └── stream.controller.ts     # GET /stream/:trackId (HTTP Range)
│           │
│           └── database/
│               └── database.module.ts       # TypeORM connection config
│
│       └── uploads/                 # Local file storage (gitignored)
│           ├── audio/
│           ├── covers/
│           └── avatars/
```

---

## Database Schema

### Entity Relationship Diagram

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────┐
│    users     │       │     tracks       │       │  playlists   │
├──────────────┤       ├──────────────────┤       ├──────────────┤
│ id (PK)      │◄──┐   │ id (PK)          │   ┌──►│ id (PK)      │
│ email        │   │   │ title            │   │   │ name         │
│ username     │   │   │ artist           │   │   │ description  │
│ password_hash│   │   │ album            │   │   │ cover_path   │
│ display_name │   │   │ genre            │   │   │ is_public    │
│ bio          │   ├───│ uploader_id (FK) │   │   │ owner_id (FK)│───┐
│ avatar_path  │   │   │ duration_seconds │   │   │ created_at   │   │
│ created_at   │   │   │ file_path        │   │   │ updated_at   │   │
│ updated_at   │   │   │ cover_path       │   │   └──────────────┘   │
└──────────────┘   │   │ file_size_bytes  │   │                      │
       ▲           │   │ mime_type        │   │   ┌────────────────┐  │
       │           │   │ waveform_data    │   │   │playlist_tracks │  │
       │           │   │ play_count       │   │   ├────────────────┤  │
       │           │   │ created_at       │   │   │ id (PK)        │  │
       │           │   │ updated_at       │   ├───│ playlist_id(FK)│  │
       │           │   └──────────────────┘   │   │ track_id (FK)  │──┘
       │           │           ▲              │   │ position       │
       │           │           │              │   │ added_at       │
       │           │           └──────────────┘   └────────────────┘
       │           │
       │           │   ┌──────────────────┐
       │           │   │  play_history    │
       │           │   ├──────────────────┤
       └───────────┼───│ user_id (FK)     │
                   │   │ track_id (FK)    │───────────────────────────
                   │   │ played_at        │
                   │   └──────────────────┘
```

### Table Details

#### `users`
| Column        | Type           | Constraints          |
|---------------|----------------|----------------------|
| id            | uuid           | PK, auto-generated   |
| email         | varchar(255)   | UNIQUE, NOT NULL     |
| username      | varchar(50)    | UNIQUE, NOT NULL     |
| password_hash | varchar(255)   | NOT NULL (bcrypt)    |
| display_name  | varchar(100)   |                      |
| bio           | text           |                      |
| avatar_path   | varchar(500)   |                      |
| created_at    | timestamptz    | DEFAULT now()        |
| updated_at    | timestamptz    | Auto-updated         |

#### `tracks`
| Column           | Type           | Constraints                    |
|------------------|----------------|--------------------------------|
| id               | uuid           | PK, auto-generated             |
| title            | varchar(255)   | NOT NULL                       |
| artist           | varchar(255)   | Extracted or user-provided     |
| album            | varchar(255)   |                                |
| genre            | varchar(100)   |                                |
| duration_seconds | float          | NOT NULL, extracted            |
| file_path        | varchar(500)   | NOT NULL                       |
| cover_path       | varchar(500)   | Extracted or uploaded          |
| file_size_bytes  | bigint         |                                |
| mime_type        | varchar(50)    | audio/mpeg, audio/flac, etc.   |
| waveform_data    | jsonb          | 150 amplitude floats           |
| play_count       | integer        | DEFAULT 0                      |
| uploader_id      | uuid FK        | -> users.id, ON DELETE CASCADE |
| created_at       | timestamptz    | DEFAULT now()                  |
| updated_at       | timestamptz    | Auto-updated                   |

**Index:** GIN index on `to_tsvector('english', title || ' ' || artist || ' ' || album || ' ' || genre)`

#### `playlists`
| Column      | Type           | Constraints                    |
|-------------|----------------|--------------------------------|
| id          | uuid           | PK, auto-generated             |
| name        | varchar(255)   | NOT NULL                       |
| description | text           |                                |
| cover_path  | varchar(500)   |                                |
| is_public   | boolean        | DEFAULT true                   |
| owner_id    | uuid FK        | -> users.id, ON DELETE CASCADE |
| created_at  | timestamptz    | DEFAULT now()                  |
| updated_at  | timestamptz    | Auto-updated                   |

#### `playlist_tracks`
| Column      | Type           | Constraints                        |
|-------------|----------------|------------------------------------|
| id          | uuid           | PK, auto-generated                 |
| playlist_id | uuid FK        | -> playlists.id, ON DELETE CASCADE |
| track_id    | uuid FK        | -> tracks.id, ON DELETE CASCADE    |
| position    | integer        | NOT NULL, for ordering             |
| added_at    | timestamptz    | DEFAULT now()                      |

**Constraints:** UNIQUE(playlist_id, track_id), INDEX(playlist_id, position)

#### `play_history`
| Column   | Type        | Constraints                    |
|----------|-------------|--------------------------------|
| id       | uuid        | PK, auto-generated             |
| user_id  | uuid FK     | -> users.id, ON DELETE CASCADE |
| track_id | uuid FK     | -> tracks.id, ON DELETE CASCADE|
| played_at| timestamptz | DEFAULT now()                  |

---

## API Design

All responses follow the shape: `{ data: T, message?: string }`

### Auth — `/api/auth`

| Method | Endpoint       | Auth | Request Body                                    | Response           |
|--------|----------------|------|------------------------------------------------|--------------------|
| POST   | /auth/signup   | No   | `{ email, username, password, displayName? }`  | `{ accessToken, user }` |
| POST   | /auth/login    | No   | `{ email, password }`                          | `{ accessToken, user }` |
| GET    | /auth/me       | Yes  | —                                              | `user`             |

### Users — `/api/users`

| Method | Endpoint             | Auth | Description                    |
|--------|----------------------|------|--------------------------------|
| GET    | /users/:id           | No   | Public profile                 |
| PATCH  | /users/me            | Yes  | Update displayName, bio        |
| PATCH  | /users/me/avatar     | Yes  | Upload avatar (multipart)      |
| GET    | /users/:id/tracks    | No   | Tracks uploaded by user        |
| GET    | /users/:id/playlists | No   | Public playlists by user       |

### Tracks — `/api/tracks`

| Method | Endpoint          | Auth | Description                                |
|--------|-------------------|------|--------------------------------------------|
| POST   | /tracks           | Yes  | Upload audio (multipart: file + metadata)  |
| GET    | /tracks           | No   | List tracks (`?page=&limit=&sort=`)        |
| GET    | /tracks/:id       | No   | Track detail                               |
| PATCH  | /tracks/:id       | Yes  | Update metadata (owner only)               |
| DELETE | /tracks/:id       | Yes  | Delete track + file (owner only)           |
| POST   | /tracks/:id/play  | No   | Increment play count                       |

### Streaming — `/api/stream`

| Method | Endpoint                 | Auth | Description                          |
|--------|--------------------------|------|--------------------------------------|
| GET    | /stream/:trackId         | No   | Stream audio with HTTP Range support |
| GET    | /stream/:trackId/waveform| No   | Return waveform amplitude JSON       |

### Playlists — `/api/playlists`

| Method | Endpoint                          | Auth | Description                              |
|--------|-----------------------------------|------|------------------------------------------|
| POST   | /playlists                        | Yes  | Create playlist                          |
| GET    | /playlists                        | No   | List public playlists (`?page=&limit=`)  |
| GET    | /playlists/:id                    | No   | Playlist detail with tracks              |
| PATCH  | /playlists/:id                    | Yes  | Update name/description/cover (owner)    |
| DELETE | /playlists/:id                    | Yes  | Delete playlist (owner)                  |
| POST   | /playlists/:id/tracks             | Yes  | Add track to playlist                    |
| DELETE | /playlists/:id/tracks/:trackId    | Yes  | Remove track from playlist               |
| PATCH  | /playlists/:id/tracks/reorder     | Yes  | `{ orderedTrackIds: string[] }`          |

### Search — `/api/search`

| Method | Endpoint | Auth | Query Params                         |
|--------|----------|------|--------------------------------------|
| GET    | /search  | No   | `q`, `type` (track/playlist/user/all), `genre`, `page`, `limit` |

---

## Audio Streaming Architecture

### Upload Flow

```
Client                          Server                           Filesystem
  │                               │                                  │
  │  POST /tracks (multipart)     │                                  │
  │  ─────────────────────────►   │                                  │
  │                               │  1. Save file via multer         │
  │                               │  ──────────────────────────────► │
  │                               │                                  │
  │                               │  2. Extract metadata             │
  │                               │     (music-metadata library)     │
  │                               │     → title, artist, album,      │
  │                               │       genre, duration, cover art │
  │                               │                                  │
  │                               │  3. Compute waveform             │
  │                               │     → 150 RMS amplitude samples  │
  │                               │     → Store as JSONB             │
  │                               │                                  │
  │                               │  4. Save cover art if embedded   │
  │                               │  ──────────────────────────────► │
  │                               │                                  │
  │                               │  5. Create Track entity in DB    │
  │                               │                                  │
  │  ◄─────────────────────────   │                                  │
  │  { data: track }              │                                  │
```

### Playback Flow

```
Browser                         Server
  │                               │
  │  <audio src="/api/stream/x">  │
  │  GET /stream/:id              │
  │  Range: bytes=0-              │
  │  ─────────────────────────►   │
  │                               │  fs.createReadStream(path, {start, end})
  │  ◄─────────────────────────   │
  │  206 Partial Content          │
  │  Content-Range: bytes 0-N/T   │
  │                               │
  │  (User seeks to 50%)          │
  │  Range: bytes=M-              │
  │  ─────────────────────────►   │
  │                               │  fs.createReadStream(path, {start: M, end})
  │  ◄─────────────────────────   │
  │  206 Partial Content          │
  │  Content-Range: bytes M-N/T   │
```

### Web Audio API Integration

```
<audio> element
    │
    ├── AudioContext.createMediaElementSource(audioEl)
    │       │
    │       ├── AnalyserNode (FFT frequency data → real-time visualization)
    │       │
    │       └── AudioContext.destination (speakers)
    │
    └── Waveform component reads pre-computed data from API
        for static waveform display + click-to-seek
```

### Storage Abstraction

```typescript
interface IStorageProvider {
  save(category: 'audio' | 'covers' | 'avatars', filename: string, data: Buffer | ReadableStream): Promise<string>;
  getReadStream(relativePath: string, opts?: { start?: number; end?: number }): ReadableStream;
  delete(relativePath: string): Promise<void>;
  getFileSize(relativePath: string): Promise<number>;
}
```

`LocalStorageService` implements this for v1. An `S3StorageService` can be swapped in later without changing any other code.

---

## Frontend Architecture

### Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│  TopBar  [🔍 Search...............................] [Avatar] │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│  Sidebar │            Main Content Area                      │
│  (250px) │                                                   │
│          │   Renders the active page:                        │
│  - Home  │   • Home (Recently Uploaded, Most Played, Genres) │
│  - Search│   • Search Results (tabbed)                       │
│  - Upload│   • Playlist Detail (sortable track list)         │
│  - Library│  • Track Detail (waveform, metadata)             │
│          │   • Upload (drag-drop form)                       │
│  ─────── │   • Profile (user info, tracks, playlists)        │
│  Your    │                                                   │
│  Playlists│                                                  │
│  - Favs  │                                                   │
│  - Chill │                                                   │
│  - Drive │                                                   │
│          │                                                   │
├──────────┴───────────────────────────────────────────────────┤
│  PlayerBar (80px, fixed bottom)                              │
│  [◄◄] [▶] [►►]   ═══════●══════════   🔊 ──  ≡ Queue       │
│  Track Title — Artist Name            1:23 / 4:05           │
└──────────────────────────────────────────────────────────────┘
```

### State Management (Zustand)

**playerStore:**
- State: `currentTrack`, `isPlaying`, `progress`, `duration`, `volume`, `queue[]`, `queueIndex`, `shuffle`, `repeat`
- Actions: `play(track)`, `pause()`, `next()`, `prev()`, `seek(pct)`, `setVolume(v)`, `addToQueue(track)`, `removeFromQueue(idx)`, `reorderQueue(from, to)`, `toggleShuffle()`, `toggleRepeat()`

**authStore:**
- State: `user`, `token`, `isAuthenticated`
- Actions: `login(email, pw)`, `signup(...)`, `logout()`, `loadFromStorage()`
- Persists token to localStorage, axios interceptor attaches `Authorization: Bearer <token>`

### Design System

| Element        | Value                                   |
|----------------|-----------------------------------------|
| Background     | `#0a0a0a` (page), `#141414` (secondary) |
| Surface        | `#1e1e1e`                               |
| Border         | `border-white/10`                       |
| Accent         | Purple-to-pink gradient                 |
| Font           | Inter / system font stack               |
| Border Radius  | `rounded-lg` (cards), `rounded-full` (avatars) |
| Effects        | Hover glow, subtle shadows on album art |
| Loading        | Skeleton components with pulse animation|

---

## Dependencies

### Backend (apps/api)

| Package                    | Purpose                        |
|----------------------------|--------------------------------|
| @nestjs/passport           | Auth framework integration     |
| passport-jwt               | JWT strategy                   |
| @nestjs/typeorm            | ORM integration                |
| typeorm                    | Database ORM                   |
| pg                         | PostgreSQL driver               |
| bcrypt                     | Password hashing               |
| music-metadata             | Audio metadata extraction      |
| class-validator            | DTO validation                 |
| class-transformer          | DTO transformation             |
| uuid                       | ID generation                  |
| multer (built-in)          | File upload handling           |

### Frontend (apps/web)

| Package                    | Purpose                        |
|----------------------------|--------------------------------|
| tailwindcss                | Utility-first CSS              |
| zustand                    | State management               |
| axios                      | HTTP client                    |
| react-hot-toast            | Toast notifications            |
| @dnd-kit/core              | Drag-and-drop framework        |
| @dnd-kit/sortable          | Sortable lists (queue/playlist)|
| framer-motion              | Animations & transitions       |
| react-hook-form            | Form handling                  |
| zod                        | Schema validation              |
| wavesurfer.js              | Waveform rendering             |

---

## Implementation Phases

### Phase 1: Project Scaffolding & Database

**Goal:** Working monorepo with database connection verified.

- Initialize root `package.json` with npm workspaces
- Scaffold Next.js app (`apps/web`) with TypeScript, Tailwind, App Router
- Scaffold NestJS app (`apps/api`)
- Create `docker-compose.yml` for PostgreSQL 13 (port 5433)
- Configure TypeORM with all 5 entities and relations
- Start API, verify tables are created

### Phase 2: Authentication

**Goal:** Users can sign up, log in, and access protected routes.

- **Backend:** AuthModule with signup (bcrypt hash + JWT), login, JwtStrategy, JwtAuthGuard, @CurrentUser decorator
- **Frontend:** LoginForm, SignupForm, authStore (zustand), axios JWT interceptor, route protection

### Phase 3: Storage & Track Upload

**Goal:** Users can upload audio files and metadata is automatically extracted.

- **Backend:** IStorageProvider interface, LocalStorageService, TracksController with multer upload (50MB max), music-metadata extraction, waveform computation (150 RMS samples), StreamController with HTTP Range support
- **Frontend:** UploadForm with drag-and-drop, upload progress bar, metadata editing, track listing page

### Phase 4: Audio Player

**Goal:** Fully functional audio player with visualization and queue.

- **Frontend:** PlayerBar (play/pause, next/prev, progress, volume, track info), playerStore (zustand), AudioPlayer (`<audio>` + Web Audio API AnalyserNode), Waveform canvas (pre-computed data, click-to-seek), QueueDrawer (drag-to-reorder)

### Phase 5: Playlists

**Goal:** Users can create, manage, and share playlists.

- **Backend:** Full CRUD for playlists, add/remove/reorder tracks
- **Frontend:** Playlist creation modal, playlist detail page with SortableTrackList, add-to-playlist dropdown on track cards, sidebar playlist listing

### Phase 6: Search & Discovery

**Goal:** Users can find music through search and browsing.

- **Backend:** PostgreSQL full-text search with tsvector/tsquery, paginated results grouped by type
- **Frontend:** Debounced SearchInput (300ms), tabbed SearchResults (tracks/playlists/users), home page sections (Recently Uploaded, Most Played, genre browse)

### Phase 7: Profiles & Polish

**Goal:** Polished, production-ready user experience.

- Profile pages (user info, uploaded tracks, playlists)
- Avatar upload
- Play count incrementing (fire-and-forget on track start)
- Loading skeleton components for all data-fetching views
- Responsive design (sidebar collapses on mobile, simplified player bar)
- Error boundaries and toast notifications for all mutations

---

## Unique & Standout Features

These features differentiate the platform from typical music players and give it a memorable identity.

---

### 1. Glassmorphism UI + Ambient Background

**What:** Every card, modal, and panel uses frosted glass styling (`backdrop-blur`, semi-transparent backgrounds) layered over a living ambient background — a large, blurred, slowly-animating version of the current track's album art that fills the entire viewport.

**How it works:**
- When a track plays, extract album art and render it as a full-screen `position: fixed` background with heavy CSS blur (`blur(80px)`) and a subtle scale/drift animation (CSS keyframes or framer-motion)
- All UI surfaces become glassmorphism cards: `bg-white/5`, `backdrop-blur-xl`, `border border-white/10`, `shadow-lg`
- The ambient colors shift smoothly when tracks change (crossfade the background images with opacity transitions)
- When no track is playing, fall back to an animated mesh gradient

**Key CSS pattern:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

**Files:**
- `apps/web/src/components/layout/AmbientBackground.tsx` — full-screen blurred album art layer
- Update all existing components (Sidebar, TopBar, PlayerBar, cards) to use glass styling
- `apps/web/src/app/globals.css` — glassmorphism utility classes

---

### 2. Vinyl Turntable Mode

**What:** The PlayerBar can expand into a full turntable view where the album art sits on a vinyl record that physically spins while playing, complete with a tonearm that drops onto the record.

**How it works:**
- Album art is rendered as a circle centered on a vinyl record graphic (dark concentric grooves visible around the art)
- CSS `animation: spin 3s linear infinite` while `isPlaying` — pauses via `animation-play-state: paused`
- A tonearm SVG pivots from the top-right corner: rotates to "playing" position when track starts, lifts when paused
- The turntable view is a toggleable overlay/expansion of the PlayerBar — click the album art in the PlayerBar to enter/exit turntable mode
- Optional: subtle vinyl crackle texture overlay on the record surface

**Components:**
- `apps/web/src/components/player/VinylTurntable.tsx` — spinning record + tonearm
- `apps/web/src/components/player/VinylRecord.tsx` — the disc with album art center + groove rings
- `apps/web/src/components/player/Tonearm.tsx` — SVG tonearm with pivot animation
- Add `turntableMode` toggle to `playerStore`

**Animation details:**
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.vinyl-spinning {
  animation: spin 3s linear infinite;
}
.vinyl-paused {
  animation-play-state: paused;
}
```

---

### 3. Audio Reactions (Timestamped Emoji Reactions)

**What:** Listeners can drop emoji reactions at specific moments in a track. These appear as floating bubbles on the waveform timeline, showing what moments people loved, found funny, or were surprised by.

**How it works:**
- While listening, a small emoji picker appears near the waveform/progress bar
- Clicking an emoji saves it with the current playback timestamp
- Reactions are displayed as emoji bubbles floating above the waveform at their respective timestamps
- Popular moments (many reactions clustered) glow brighter or stack higher
- Hovering a reaction cluster shows who reacted and with what

**Database — new `track_reactions` table:**

| Column    | Type         | Notes                          |
|-----------|--------------|--------------------------------|
| id        | uuid PK      |                                |
| track_id  | uuid FK      | -> tracks.id, ON DELETE CASCADE|
| user_id   | uuid FK      | -> users.id, ON DELETE CASCADE |
| emoji     | varchar(10)  | The emoji character            |
| timestamp | float        | Seconds into the track         |
| created_at| timestamptz  |                                |

UNIQUE(track_id, user_id, timestamp) to prevent spam at the same moment.

**API endpoints:**
- `POST /tracks/:id/reactions` — `{ emoji, timestamp }` (auth required)
- `GET /tracks/:id/reactions` — returns all reactions grouped by timestamp ranges
- `DELETE /tracks/:id/reactions/:reactionId` — remove own reaction

**Frontend components:**
- `apps/web/src/components/player/ReactionBar.tsx` — emoji picker + floating reaction bubbles on waveform
- `apps/web/src/components/player/ReactionBubble.tsx` — individual floating emoji with tooltip
- Reactions render as absolutely positioned elements on the waveform, mapped from `(timestamp / duration) * 100`%

---

### 4. Mood-Based Discovery

**What:** A unique discovery surface where users select their current mood and get a curated feed of matching tracks. The UI features a mood-ring visual that shifts colors based on selection.

**How it works:**
- Moods: `chill`, `hype`, `sad`, `focus`, `romantic`, `angry`, `happy`, `dreamy`
- Each mood maps to genres/tags and has a signature color gradient:
  - Chill → blue-to-teal, Focus → green-to-emerald, Hype → red-to-orange, Sad → indigo-to-gray, etc.
- Tracks are tagged with moods (auto-suggested based on genre, or manually set by uploader)
- The mood page shows a circular mood selector (ring of colored orbs), selecting one transitions the entire page to that mood's color scheme and shows matching tracks

**Database changes:**
- Add `mood` column to `tracks` table: `varchar(20)`, nullable
- Add mood as a filterable field in search

**API:**
- `GET /tracks?mood=chill&page=1&limit=20` — filter tracks by mood
- Track upload DTO gains optional `mood` field

**Frontend:**
- `apps/web/src/app/discover/page.tsx` — the mood discovery page
- `apps/web/src/components/discover/MoodSelector.tsx` — circular ring of mood orbs with glow effects
- `apps/web/src/components/discover/MoodFeed.tsx` — track grid filtered by selected mood
- Page background gradient animates to match selected mood color

**Mood color map:**
```typescript
const moodColors = {
  chill:    { from: '#3B82F6', to: '#14B8A6' },
  hype:    { from: '#EF4444', to: '#F97316' },
  sad:      { from: '#6366F1', to: '#6B7280' },
  focus:    { from: '#10B981', to: '#059669' },
  romantic: { from: '#EC4899', to: '#F43F5E' },
  angry:    { from: '#DC2626', to: '#7C2D12' },
  happy:    { from: '#FBBF24', to: '#F59E0B' },
  dreamy:   { from: '#8B5CF6', to: '#A78BFA' },
};
```

---

### 5. Collaborative Playlists

**What:** Playlist owners can invite others to collaborate. Collaborators can add tracks, and all members can vote tracks up/down to influence ordering. Changes appear in real-time via WebSockets.

**How it works:**
- Playlist owner toggles "collaborative" mode and shares an invite link
- Collaborators can add tracks and vote (upvote/downvote) on existing tracks
- Tracks are sorted by vote score (descending), then by date added
- Real-time updates via WebSocket gateway — when someone adds a track or votes, all viewers see it instantly

**Database — new tables:**

`playlist_collaborators`:

| Column      | Type      | Notes                            |
|-------------|-----------|----------------------------------|
| id          | uuid PK   |                                  |
| playlist_id | uuid FK   | -> playlists.id, ON DELETE CASCADE|
| user_id     | uuid FK   | -> users.id, ON DELETE CASCADE   |
| role        | varchar   | 'editor' or 'viewer'            |
| joined_at   | timestamptz |                                |

UNIQUE(playlist_id, user_id)

`playlist_votes`:

| Column      | Type      | Notes                            |
|-------------|-----------|----------------------------------|
| id          | uuid PK   |                                  |
| playlist_track_id | uuid FK | -> playlist_tracks.id, ON DELETE CASCADE |
| user_id     | uuid FK   | -> users.id, ON DELETE CASCADE   |
| value       | integer   | +1 or -1                         |
| created_at  | timestamptz |                                |

UNIQUE(playlist_track_id, user_id)

**Database changes to `playlists` table:**
- Add `is_collaborative` boolean (default false)
- Add `invite_code` varchar(20) unique nullable

**API endpoints:**
- `PATCH /playlists/:id` — toggle `is_collaborative`
- `POST /playlists/:id/invite` — generate invite link (returns invite code)
- `POST /playlists/join/:inviteCode` — join as collaborator
- `GET /playlists/:id/collaborators` — list collaborators
- `DELETE /playlists/:id/collaborators/:userId` — remove collaborator (owner only)
- `POST /playlists/:id/tracks/:trackId/vote` — `{ value: 1 | -1 }`
- `DELETE /playlists/:id/tracks/:trackId/vote` — remove vote

**WebSocket gateway (NestJS):**
- `@nestjs/websockets` + `socket.io`
- Gateway: `PlaylistGateway` — rooms per playlist ID
- Events emitted: `track-added`, `track-removed`, `vote-updated`, `collaborator-joined`
- Frontend connects when viewing a collaborative playlist, listens for real-time updates

**Backend files:**
- `apps/api/src/modules/playlists/playlist-collaborator.entity.ts`
- `apps/api/src/modules/playlists/playlist-vote.entity.ts`
- `apps/api/src/modules/playlists/playlist.gateway.ts` — WebSocket gateway
- Update `playlists.service.ts` and `playlists.controller.ts`

**Frontend files:**
- `apps/web/src/components/playlist/CollaborativePlaylist.tsx` — real-time playlist view
- `apps/web/src/components/playlist/VoteButton.tsx` — upvote/downvote with count
- `apps/web/src/components/playlist/InviteModal.tsx` — share invite link
- `apps/web/src/hooks/usePlaylistSocket.ts` — WebSocket connection hook
- Add `socket.io-client` dependency

---

### 6. Music Stats Dashboard ("Your Wrapped")

**What:** A personal analytics dashboard showing listening habits — total listening time, top tracks, top genres, listening streaks, peak hours, and a visual "year in music" summary.

**How it works:**
- Built on the existing `play_history` table — every track play is already logged
- Backend aggregates data with SQL queries (GROUP BY, window functions)
- Frontend renders stats with animated counters, charts, and visual cards

**API endpoints:**
- `GET /users/me/stats` — returns aggregated listening statistics
- `GET /users/me/stats/top-tracks?period=week|month|year&limit=10`
- `GET /users/me/stats/top-genres?period=week|month|year`
- `GET /users/me/stats/activity?period=month` — daily listening minutes for heatmap/chart

**Response shape for `/users/me/stats`:**
```json
{
  "totalListeningMinutes": 4230,
  "totalTracksPlayed": 892,
  "uniqueTracksPlayed": 156,
  "currentStreak": 12,
  "longestStreak": 34,
  "topTrack": { "track": {...}, "playCount": 47 },
  "topGenre": "Electronic",
  "peakHour": 22,
  "averageDailyMinutes": 45,
  "genreDistribution": [
    { "genre": "Electronic", "percentage": 35 },
    { "genre": "Hip-Hop", "percentage": 25 },
    ...
  ]
}
```

**Frontend:**
- `apps/web/src/app/stats/page.tsx` — stats dashboard page
- `apps/web/src/components/stats/StatCard.tsx` — animated number counter card
- `apps/web/src/components/stats/GenreChart.tsx` — donut/pie chart of genre distribution
- `apps/web/src/components/stats/ListeningHeatmap.tsx` — GitHub-style contribution heatmap of daily listening
- `apps/web/src/components/stats/TopTracksList.tsx` — ranked list with play count bars
- `apps/web/src/components/stats/StreakBadge.tsx` — current streak with fire animation

**Additional dependency:** A lightweight chart library like `recharts` or pure SVG/canvas rendering.

---

### 7. Play from Link (Multi-Platform Import)

**What:** Users can paste a link from YouTube, SoundCloud, Spotify, or any direct audio URL, and the platform will extract the audio, pull metadata, and add it to their library — ready to stream like any uploaded track.

**How it works:**
- User pastes a URL into an "Import from Link" form
- Backend detects the platform from the URL pattern
- Uses `yt-dlp` (a powerful CLI tool) to extract audio from YouTube, SoundCloud, and dozens of other platforms
- For Spotify links: extract track metadata (title, artist, album art) via Spotify Web API, then search and download the audio from an alternative source (YouTube Music match)
- For direct audio URLs (`.mp3`, `.wav`, `.flac`): download the file directly
- Extracted audio is saved to local storage, metadata is parsed, waveform is computed — the same pipeline as a regular upload
- The track appears in the user's library as a normal track

**Supported platforms:**
- YouTube / YouTube Music
- SoundCloud
- Spotify (metadata + YouTube Music fallback for audio)
- Bandcamp
- Direct audio file URLs (mp3, wav, flac, ogg, m4a)
- Any platform supported by `yt-dlp` (1000+ sites)

**Backend flow:**
```
User pastes URL
    │
    ▼
POST /tracks/import { url }
    │
    ├─ Detect platform from URL pattern
    │
    ├─ YouTube/SoundCloud/Bandcamp/etc:
    │   └─ Spawn `yt-dlp --extract-audio --audio-format mp3 --audio-quality 0`
    │      └─ Outputs: audio file + metadata JSON (title, artist, thumbnail, duration)
    │
    ├─ Spotify:
    │   ├─ Fetch track metadata from Spotify Web API (title, artist, album, art)
    │   └─ Search YouTube Music for "{title} {artist}" → download via yt-dlp
    │
    ├─ Direct audio URL:
    │   └─ Download file, parse with music-metadata
    │
    ▼
Same pipeline as upload:
    → Save audio to storage
    → Extract/confirm metadata
    → Compute waveform (150 samples)
    → Create Track entity in DB
    → Return track object
```

**Database changes:**
- Add `source_url` column to `tracks` table: `varchar(1000)`, nullable — stores the original import URL
- Add `source_platform` column to `tracks` table: `varchar(50)`, nullable — 'youtube', 'soundcloud', 'spotify', 'bandcamp', 'direct', etc.

**API endpoints:**
- `POST /tracks/import` — `{ url: string }` (auth required)
  - Validates URL format
  - Returns `{ data: track, message: "Track imported successfully" }`
  - May take 10-30 seconds for extraction — consider returning 202 Accepted with a job ID for long extractions
- `GET /tracks/import/:jobId/status` — poll import progress (optional, for large files)

**Backend implementation details:**

`apps/api/src/modules/tracks/link-import.service.ts`:
```typescript
// Platform detection
function detectPlatform(url: string): 'youtube' | 'soundcloud' | 'spotify' | 'bandcamp' | 'direct' | 'other' {
  if (/youtu(\.be|be\.com)/.test(url)) return 'youtube';
  if (/soundcloud\.com/.test(url)) return 'soundcloud';
  if (/open\.spotify\.com/.test(url)) return 'spotify';
  if (/bandcamp\.com/.test(url)) return 'bandcamp';
  if (/\.(mp3|wav|flac|ogg|m4a|aac)(\?.*)?$/.test(url)) return 'direct';
  return 'other'; // try yt-dlp anyway, it supports 1000+ sites
}

// yt-dlp extraction (spawns child process)
// Command: yt-dlp -x --audio-format mp3 --audio-quality 0 -o "output.%(ext)s" --print-json <url>
// Returns: audio file path + JSON metadata (title, artist/uploader, thumbnail URL, duration)
```

**yt-dlp setup:**
- Install on server: `pip install yt-dlp` or download binary
- Also needs `ffmpeg` for audio conversion
- Add to docker-compose or install as system dependency
- Backend spawns it via Node.js `child_process.execFile()`

**Spotify integration (optional, requires API keys):**
- Register app at Spotify Developer Dashboard
- Use Client Credentials flow (no user login needed) to fetch track metadata
- Search YouTube Music for matching audio, download via yt-dlp
- Env vars: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`

**Frontend:**
- `apps/web/src/app/import/page.tsx` — import page with URL input
- `apps/web/src/components/track/ImportForm.tsx` — paste URL, shows loading state, preview of detected metadata before confirming import
- UI flow:
  1. User pastes URL
  2. Frontend sends to backend
  3. Show loading spinner with "Extracting audio from YouTube..." / platform name
  4. On success: show track preview (title, artist, cover art, duration) with "Added to Library" confirmation
  5. Track is immediately playable

**Import form wireframe:**
```
┌─────────────────────────────────────────────────┐
│  Import from Link                               │
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │ 🔗 Paste a URL...                        │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Supported: YouTube, SoundCloud, Spotify,       │
│  Bandcamp, direct audio links, and 1000+ more   │
│                                                 │
│  ┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  (After URL detected)                    │  │
│  │  ┌────┐                                  │  │
│  │  │ 🎵 │  Track Title                     │  │
│  │  │art │  Artist Name                     │  │
│  │  └────┘  3:42 • YouTube                  │  │
│  │                                          │  │
│  │  [Import to Library]                     │  │
│  └─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
└─────────────────────────────────────────────────┘
```

**Backend files:**
- `apps/api/src/modules/tracks/link-import.service.ts` — URL detection, yt-dlp spawning, metadata extraction
- `apps/api/src/modules/tracks/spotify.service.ts` — Spotify API integration (optional)
- Update `tracks.controller.ts` — add `POST /tracks/import` endpoint
- Update `tracks.module.ts` — register new services

**Environment variables:**
```env
YTDLP_PATH=/usr/local/bin/yt-dlp    # path to yt-dlp binary
FFMPEG_PATH=/usr/bin/ffmpeg          # path to ffmpeg binary
SPOTIFY_CLIENT_ID=                   # optional, for Spotify link support
SPOTIFY_CLIENT_SECRET=               # optional, for Spotify link support
```

---

### 8. AI-Powered Features

**What:** Intelligent features that personalize the experience and keep users engaged.

#### AI Playlist Generator ("Make me a playlist")

- User types a natural language prompt: "songs for coding at 2am", "road trip with friends", "rainy Sunday morning"
- Backend sends the prompt + user's library/listening history to an LLM (Claude API)
- LLM returns a curated list of track IDs from the library that match the vibe
- A playlist is auto-created with a generated name and description

**API:**
- `POST /playlists/ai-generate` — `{ prompt: string }` (auth required)
- Returns the created playlist with matched tracks

**Backend:**
- `apps/api/src/modules/playlists/ai-playlist.service.ts` — sends prompt + track catalog to LLM, parses response, creates playlist
- Uses Claude API (`@anthropic-ai/sdk`) with a system prompt that understands music genres, moods, and vibes
- Falls back to keyword/mood matching if AI service is unavailable

**Frontend:**
- `apps/web/src/components/playlist/AiPlaylistGenerator.tsx` — text input with sparkle icon, loading animation while generating, shows result

#### Daily Mix (Auto-Generated Playlists)

- System generates 2-3 "Daily Mix" playlists per user each day based on listening history
- Mixes cluster by genre/mood similarity — "Daily Mix 1: Electronic & Chill", "Daily Mix 2: Hip-Hop & Hype"
- Refreshed every 24 hours via a scheduled job

**Backend:**
- `apps/api/src/modules/playlists/daily-mix.service.ts` — analyzes play_history, clusters by genre, selects tracks
- Cron job runs daily (or on-demand when user opens home page and mixes are stale)
- System-generated playlists have `is_system: true` flag, `owner_id` = the user

**Database changes:**
- Add `is_system` boolean to `playlists` table (default false) — marks auto-generated playlists

**Frontend:**
- Home page shows "Your Daily Mixes" section above regular content
- Each mix card shows dominant genre colors

#### Smart Recommendations

- "Because you listened to X" recommendation rows on the home page
- Based on genre/mood/artist overlap from play_history
- Simple collaborative filtering: users who listened to A also listened to B

**API:**
- `GET /tracks/recommendations?limit=20` — personalized track recommendations

**Backend:**
- `apps/api/src/modules/tracks/recommendations.service.ts` — queries play_history, finds genre/artist overlaps, returns ranked suggestions

#### Auto-Tagging

- On upload, automatically detect and suggest: genre, mood, BPM
- Uses audio analysis (BPM via `detect-bpm` or ffmpeg) + metadata heuristics
- User can accept/edit suggestions before saving

**Backend:**
- Add BPM detection to `audio-analysis.service.ts`
- `apps/api/src/modules/tracks/auto-tag.service.ts` — genre/mood inference from audio features

**Database changes:**
- Add `bpm` integer column to `tracks` table (nullable)

---

### 9. Social Features

#### Follow System

- Users can follow other users/artists
- Following creates a personalized activity feed

**Database — new `follows` table:**

| Column      | Type        | Notes                            |
|-------------|-------------|----------------------------------|
| id          | uuid PK     |                                  |
| follower_id | uuid FK     | -> users.id, ON DELETE CASCADE   |
| following_id| uuid FK     | -> users.id, ON DELETE CASCADE   |
| created_at  | timestamptz |                                  |

UNIQUE(follower_id, following_id). Cannot follow yourself.

**Database changes to `users` table:**
- Add `followers_count` integer (default 0, denormalized for performance)
- Add `following_count` integer (default 0)

**API:**
- `POST /users/:id/follow` — follow a user
- `DELETE /users/:id/follow` — unfollow
- `GET /users/:id/followers?page=&limit=` — list followers
- `GET /users/:id/following?page=&limit=` — list following
- `GET /feed?page=&limit=` — activity feed from followed users

**Frontend:**
- Follow/Unfollow button on profile pages and user cards
- `apps/web/src/app/feed/page.tsx` — activity feed page
- `apps/web/src/components/social/ActivityFeed.tsx` — feed of uploads, playlists, likes from followed users
- `apps/web/src/components/social/FollowButton.tsx`

#### Activity Feed

**Database — new `activities` table:**

| Column      | Type        | Notes                                    |
|-------------|-------------|------------------------------------------|
| id          | uuid PK     |                                          |
| user_id     | uuid FK     | -> users.id, who performed the action    |
| type        | varchar(50) | 'upload', 'playlist_create', 'like', 'follow' |
| target_type | varchar(50) | 'track', 'playlist', 'user'              |
| target_id   | uuid        | ID of the track/playlist/user            |
| created_at  | timestamptz |                                          |

Activities are created automatically when users upload tracks, create playlists, follow someone, etc.

#### Social Share Cards

- When a track or playlist URL is shared on social media, render a rich Open Graph preview
- Shows album art, track title, artist, duration, and a 30-second audio preview player
- Implemented via Next.js metadata API (`generateMetadata`) + Open Graph image generation

**Frontend:**
- `apps/web/src/app/track/[trackId]/opengraph-image.tsx` — dynamic OG image with album art + track info
- `apps/web/src/app/playlist/[playlistId]/opengraph-image.tsx` — playlist OG image
- Meta tags: `og:audio` for audio preview URL

#### Track Comments

- Threaded text comments on tracks (separate from emoji reactions)
- Users can reply to comments, creating threads

**Database — new `track_comments` table:**

| Column      | Type        | Notes                            |
|-------------|-------------|----------------------------------|
| id          | uuid PK     |                                  |
| track_id    | uuid FK     | -> tracks.id, ON DELETE CASCADE  |
| user_id     | uuid FK     | -> users.id, ON DELETE CASCADE   |
| parent_id   | uuid FK     | -> track_comments.id (nullable, for replies) |
| content     | text        | NOT NULL, max 1000 chars         |
| created_at  | timestamptz |                                  |

**API:**
- `POST /tracks/:id/comments` — `{ content, parentId? }`
- `GET /tracks/:id/comments?page=&limit=` — paginated, threaded
- `DELETE /tracks/:id/comments/:commentId` — delete own comment

**Frontend:**
- `apps/web/src/components/track/CommentSection.tsx` — comment list + reply threads
- `apps/web/src/components/track/CommentForm.tsx` — text input with submit

#### Listening Activity Status

- Profile pages show "Currently listening to: Track Name — Artist"
- Uses WebSocket to broadcast current track to followers
- Shows on profile page and in follower activity feeds

**Backend:**
- Extend `PlaylistGateway` (or create `PresenceGateway`) to track user's current track
- `GET /users/:id` response includes `currentlyPlaying: { track, startedAt }` if online

---

### 10. Enhanced Player Experience

#### Keyboard Shortcuts

| Shortcut     | Action              |
|-------------|---------------------|
| `Space`      | Play / Pause        |
| `←` / `→`   | Seek -5s / +5s      |
| `N`          | Next track          |
| `P`          | Previous track      |
| `M`          | Mute / Unmute       |
| `↑` / `↓`   | Volume up / down    |
| `S`          | Toggle shuffle      |
| `R`          | Cycle repeat mode   |
| `Q`          | Toggle queue drawer |
| `V`          | Toggle vinyl mode   |
| `L`          | Like/unlike track   |

**Frontend:**
- `apps/web/src/hooks/useKeyboardShortcuts.ts` — global keyboard event listener, maps keys to playerStore actions
- Register in root `layout.tsx`
- `apps/web/src/components/ui/ShortcutsModal.tsx` — press `?` to show shortcuts reference

#### Lyrics Display

- Show synced (line-by-line timed) or static lyrics alongside the player
- Lyrics auto-scroll to the current line during playback
- Source: user-uploaded `.lrc` files or manually entered lyrics

**Database changes:**
- Add `lyrics` text column to `tracks` table (nullable) — plain text or LRC format
- Add `lyrics_synced` boolean to `tracks` table (default false) — whether lyrics are timed

**API:**
- `GET /tracks/:id/lyrics` — returns lyrics text
- `PATCH /tracks/:id/lyrics` — upload/update lyrics (owner only)

**Frontend:**
- `apps/web/src/components/player/LyricsPanel.tsx` — scrolling lyrics display, highlights current line
- Toggle button in PlayerBar to show/hide lyrics panel
- LRC parser in `apps/web/src/lib/lrc-parser.ts` — parses `[mm:ss.xx] line` format

#### Equalizer

- User-adjustable audio EQ with preset and custom modes
- Uses Web Audio API `BiquadFilterNode` chain (5-band or 10-band)

**Presets:**
- Flat, Bass Boost, Treble Boost, Vocal, Rock, Electronic, Acoustic, Night Mode (reduced bass)

**Frontend:**
- `apps/web/src/components/player/Equalizer.tsx` — visual EQ sliders (vertical bars per frequency band)
- `apps/web/src/hooks/useEqualizer.ts` — creates BiquadFilterNode chain, connects to AudioContext
- EQ settings saved to localStorage per user
- Toggle button in PlayerBar

#### Sleep Timer

- Set a timer to stop playback after X minutes
- Presets: 15, 30, 45, 60, 90 minutes + custom

**Frontend:**
- `apps/web/src/components/player/SleepTimer.tsx` — dropdown with presets + countdown display
- Timer state in playerStore: `sleepTimerEnd: number | null`
- When timer expires, pause playback and show a toast

#### Mini Player (Picture-in-Picture)

- Floating mini player that stays visible when scrolling or on other pages
- Shows album art, track title, play/pause, next/prev
- Can be dragged to reposition

**Frontend:**
- `apps/web/src/components/player/MiniPlayer.tsx` — small draggable card with essential controls
- Uses browser PiP API for video-based visualization, or a custom floating div
- Toggle between full PlayerBar and MiniPlayer

#### Offline Mode (PWA)

- Convert the app to a Progressive Web App
- Users can mark tracks for offline listening
- Service worker caches audio files + app shell

**Implementation:**
- `apps/web/public/manifest.json` — PWA manifest
- `apps/web/public/sw.js` — service worker for caching
- `next.config.js` — PWA plugin (`next-pwa`)
- Download button on tracks → caches audio in browser storage
- Offline indicator in TopBar when connection is lost

---

### 11. Gamification & Engagement

#### Badges & Achievements

Unlock badges for milestones and behaviors:

| Badge             | Condition                              |
|-------------------|----------------------------------------|
| First Upload      | Upload your first track                |
| Playlist Curator  | Create 5 playlists                     |
| Century Club      | Play 100 different tracks              |
| Night Owl         | Listen between midnight and 4am        |
| Early Bird        | Listen between 5am and 7am            |
| Social Butterfly  | Get 10 followers                       |
| Binge Listener    | Listen for 3+ hours in one session     |
| Genre Explorer    | Listen to tracks in 10+ genres         |
| Streak Master     | Maintain a 30-day listening streak     |
| Collaborator      | Contribute to 5 collaborative playlists|

**Database — new `user_badges` table:**

| Column      | Type        | Notes                            |
|-------------|-------------|----------------------------------|
| id          | uuid PK     |                                  |
| user_id     | uuid FK     | -> users.id, ON DELETE CASCADE   |
| badge_type  | varchar(50) | Badge identifier                 |
| earned_at   | timestamptz |                                  |

UNIQUE(user_id, badge_type)

**Backend:**
- `apps/api/src/modules/users/badges.service.ts` — checks conditions, awards badges, emits notifications
- Badge checks run after relevant actions (upload → check "First Upload", play → check "Century Club", etc.)

**API:**
- `GET /users/:id/badges` — list earned badges
- `GET /badges` — list all available badges with descriptions

**Frontend:**
- `apps/web/src/components/profile/BadgeGrid.tsx` — display earned badges on profile
- `apps/web/src/components/ui/BadgeUnlockToast.tsx` — celebratory toast when a badge is earned
- Badges shown as icons with tooltip descriptions

#### Listening Streaks (Enhanced)

- Track consecutive days of listening (already in stats, now with rewards)
- Visual flame icon that grows with streak length
- Streak freeze: users get 1 free "freeze" per week to preserve streak if they miss a day

**Database changes:**
- Add `current_streak` integer to `users` table (default 0)
- Add `longest_streak` integer to `users` table (default 0)
- Add `last_listened_date` date to `users` table
- Add `streak_freezes` integer to `users` table (default 1, resets weekly)

#### Leaderboards

- Public leaderboards showcasing top contributors

**Types:**
- Top Listeners (most minutes this week/month)
- Top Uploaders (most tracks uploaded)
- Trending Tracks (most plays in last 7 days)
- Rising Artists (fastest follower growth)

**API:**
- `GET /leaderboards/:type?period=week|month|all` — paginated leaderboard

**Frontend:**
- `apps/web/src/app/leaderboards/page.tsx` — leaderboard page with tabs
- `apps/web/src/components/social/LeaderboardTable.tsx` — ranked table with avatars, stats, badges

#### Listening Challenges

- Weekly/monthly challenges: "Listen to 20 new artists this week", "Play tracks from 5 different genres today"
- Completing challenges earns XP and unlocks special badges

**Database — new `challenges` and `user_challenges` tables:**

`challenges`:
| Column      | Type        | Notes                            |
|-------------|-------------|----------------------------------|
| id          | uuid PK     |                                  |
| title       | varchar(255)|                                  |
| description | text        |                                  |
| type        | varchar(50) | 'daily', 'weekly', 'monthly'     |
| target_value| integer     | e.g., 20 for "listen to 20"     |
| metric      | varchar(50) | 'new_artists', 'genres', 'minutes', 'tracks' |
| starts_at   | timestamptz |                                  |
| ends_at     | timestamptz |                                  |

`user_challenges`:
| Column       | Type        | Notes                            |
|--------------|-------------|----------------------------------|
| id           | uuid PK     |                                  |
| user_id      | uuid FK     |                                  |
| challenge_id | uuid FK     |                                  |
| progress     | integer     | Current progress toward target   |
| completed    | boolean     | default false                    |
| completed_at | timestamptz | nullable                         |

**Frontend:**
- `apps/web/src/components/social/ChallengeCard.tsx` — progress bar, time remaining, reward preview

---

### 12. Creator Tools

#### Artist Analytics Dashboard

- Detailed analytics for track uploaders
- Views: total plays, unique listeners, play sources, geographic distribution, trending tracks

**API:**
- `GET /users/me/analytics` — overview stats
- `GET /users/me/analytics/tracks` — per-track performance
- `GET /users/me/analytics/listeners` — listener demographics
- `GET /users/me/analytics/timeline?period=7d|30d|90d` — plays over time

**Frontend:**
- `apps/web/src/app/analytics/page.tsx` — creator analytics dashboard
- `apps/web/src/components/analytics/PlaysChart.tsx` — line chart of plays over time
- `apps/web/src/components/analytics/TrackPerformance.tsx` — ranked table of tracks by plays
- `apps/web/src/components/analytics/ListenerMap.tsx` — geographic distribution (optional)

#### Embeddable Player Widget

- Artists get an embed code to showcase tracks on external websites
- Small iframe-based player with play button, waveform, and track info

**API:**
- `GET /embed/:trackId` — returns embeddable HTML page (standalone, minimal CSS/JS)

**Frontend:**
- `apps/web/src/app/embed/[trackId]/page.tsx` — minimal standalone player page (no sidebar/topbar)
- Embed code generator on track detail pages: `<iframe src="https://yourapp.com/embed/trackId" width="400" height="80"></iframe>`
- `apps/web/src/components/track/EmbedCodeModal.tsx` — copy embed code to clipboard

**Embed widget wireframe:**
```
┌──────────────────────────────────────┐
│ ┌────┐                              │
│ │ ▶  │  Track Title — Artist  3:42  │
│ │art │  ═══●══════════════════      │
│ └────┘           yourapp.com        │
└──────────────────────────────────────┘
```

#### Release Scheduling

- Artists can upload a track but schedule it to go live at a future date/time
- Fans see a countdown timer on the artist's profile
- Track becomes playable automatically at the scheduled time

**Database changes:**
- Add `scheduled_release_at` timestamptz to `tracks` table (nullable)
- Add `is_published` boolean to `tracks` table (default true)
- Tracks with `is_published = false` and a future `scheduled_release_at` are hidden from public but visible to the uploader

**API:**
- Track creation accepts optional `scheduledReleaseAt` field
- Cron job or DB query filter: tracks where `scheduled_release_at <= now() AND is_published = false` → set `is_published = true`
- `GET /users/:id/upcoming` — scheduled releases for an artist (public countdown)

**Frontend:**
- `apps/web/src/components/track/ScheduleRelease.tsx` — date/time picker in upload form
- `apps/web/src/components/track/CountdownTimer.tsx` — live countdown on artist profile
- `apps/web/src/components/profile/UpcomingReleases.tsx` — list of scheduled tracks with countdowns

#### Artist Verification

- Verified badge (checkmark) for established artists
- Initially manual (admin grants verification), later criteria-based (e.g., 1000+ followers, 10+ uploads)

**Database changes:**
- Add `is_verified` boolean to `users` table (default false)

**API:**
- Admin-only: `PATCH /admin/users/:id/verify` — toggle verification

**Frontend:**
- Verified checkmark icon next to artist name everywhere it appears (profile, track cards, search results)
- `apps/web/src/components/ui/VerifiedBadge.tsx` — small blue checkmark component

---

### Updated Implementation Phases

| Phase | Features |
|-------|----------|
| Phase 1-7 | Core features (as documented above) |
| **Phase 8** | **Glassmorphism UI + Ambient Background** — visual overhaul of all existing components |
| **Phase 9** | **Vinyl Turntable Mode** — expanded player view with spinning record |
| **Phase 10** | **Audio Reactions** — new table, API, reaction bar on waveform |
| **Phase 11** | **Mood Discovery** — mood column, mood selector page, filtered feed |
| **Phase 12** | **Music Stats Dashboard** — aggregation queries, stats page with charts |
| **Phase 13** | **Collaborative Playlists** — new tables, WebSocket gateway, real-time UI |
| **Phase 14** | **Play from Link** — yt-dlp integration, multi-platform import, Spotify metadata |
| **Phase 15** | **AI Features** — AI playlist generator (Claude API), daily mixes, smart recommendations, auto-tagging |
| **Phase 16** | **Social — Follow & Feed** — follows table, activity feed, follow/unfollow UI |
| **Phase 17** | **Social — Comments & Sharing** — track comments, threaded replies, OG share cards |
| **Phase 18** | **Player Enhancements** — keyboard shortcuts, lyrics display, equalizer, sleep timer |
| **Phase 19** | **Mini Player & Offline** — PiP mini player, PWA conversion, offline caching |
| **Phase 20** | **Gamification** — badges, streaks, leaderboards, challenges |
| **Phase 21** | **Creator Tools** — artist analytics, embeddable widget, release scheduling, verification |

### Additional Dependencies

| Package              | Purpose                                    |
|----------------------|--------------------------------------------|
| socket.io            | WebSocket server (collaborative playlists) |
| socket.io-client     | WebSocket client                           |
| @nestjs/websockets   | NestJS WebSocket integration               |
| recharts             | Charts for stats/analytics dashboards      |
| yt-dlp (system)      | Audio extraction from YouTube, SoundCloud, 1000+ sites |
| ffmpeg (system)       | Audio format conversion + waveform analysis|
| @anthropic-ai/sdk    | Claude API for AI playlist generation      |
| next-pwa             | PWA support for offline mode               |
| detect-bpm           | BPM detection for auto-tagging             |

---

## Running the Application

### Prerequisites

- Node.js 22+
- npm 10+
- Docker (for PostgreSQL)

### Environment Variables (`apps/api/.env`)

```env
DATABASE_URL=postgres://music:music@localhost:5433/music_player
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRATION=7d
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
PORT=3001
```

### Start Services

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Start API server (port 3001)
cd apps/api
npm run start:dev

# 3. Start web app (port 3000)
cd apps/web
npm run dev
```

### Frontend Configuration

Set `NEXT_PUBLIC_API_URL=http://localhost:3001` in `apps/web/.env.local`. CORS is enabled in the NestJS bootstrap (`main.ts`).

---

## Implementation Status

### Core Features — ALL COMPLETE
- [x] PostgreSQL running via Docker, tables auto-created by TypeORM
- [x] Sign up creates user, login returns valid JWT
- [x] JWT protects routes, `/auth/me` returns current user
- [x] Upload accepts audio files, extracts metadata and cover art
- [x] Waveform data computed via real ffmpeg analysis and stored as JSONB
- [x] Streaming serves audio with Range request support (seek works)
- [x] Player plays/pauses, shows progress, volume control works
- [x] Waveform component renders on track detail with reaction overlay
- [x] QueueDrawer with view/play/remove/clear queue actions
- [x] Playlists: create, add tracks, remove tracks, reorder, delete
- [x] Search uses PostgreSQL full-text search (tsvector) with mood filtering
- [x] Profile page displays user info, tracks, playlists, avatar upload
- [x] Responsive layout works on mobile viewports
- [x] Loading skeletons display while data is fetching
- [x] AudioPlayer component with Web Audio API (AudioContext + BiquadFilter EQ chain)
- [x] Modular VolumeControl component

### Unique Features — ALL COMPLETE
- [x] Ambient background with dynamic mood-based gradients and blur
- [x] All UI cards/panels use glassmorphism (frosted glass, backdrop-blur)
- [x] Vinyl turntable mode: album art spins while playing, tonearm animates
- [x] Emoji reactions can be placed at timestamps on a track's waveform
- [x] Reaction bubbles display on waveform at correct positions
- [x] Mood selector page with 8 moods, colored gradients, filtered feed
- [x] Tracks filterable by mood on upload and search
- [x] Stats dashboard shows total listening time, top tracks, genre distribution, streaks
- [x] Collaborative playlists: invite codes, roles (editor/viewer), voting
- [x] Real-time playlist updates via WebSocket gateway (add/remove/reorder/vote broadcast)
- [x] Import from link: YouTube, SoundCloud, Spotify, Bandcamp, direct URLs via yt-dlp

### AI & Personalization
- [x] AI playlist generator creates playlist from natural language prompt (Claude API with keyword fallback)
- [x] Daily Mixes: backend generates 3 system playlists by genre/mood
- [x] Daily Mix frontend UI: HomeContent fetches `GET /playlists/daily-mixes` and renders mix cards (authenticated users only)
- [x] Recommendations section on home page with "Because you like [genre]" / "More from [artist]" context per track
- [x] BPM detection: extracted from music-metadata embed data first, falls back to ffmpeg autocorrelation onset detection (60–200 BPM range)
- [x] Auto-tagging: genre and mood inferred from BPM + average audio energy when user leaves fields blank. BPM ranges mapped to genre/mood heuristics (e.g. 130–150 BPM high energy → Dance/hype). BPM pill shown on track detail page. UploadForm labels genre/mood fields as "auto-tagged if blank".

### Social
- [x] Follow/unfollow users with follower/following count tracking
- [x] Activity feed page shows uploads, playlists, follows from followed users
- [x] Track comments with threaded replies (CommentSection component)
- [x] Social share cards: `opengraph-image.tsx` added to track and playlist routes — generates dynamic OG images with album art, title, artist, genre, BPM
- [x] "Currently listening to" status: PresenceGateway (WebSocket `/presence` namespace) broadcasts playback state; ProfileView shows live animated indicator; PlayerBar broadcasts on play/pause/track change

### Player Enhancements
- [x] Keyboard shortcuts (10 bindings: Space, arrows, N/P, M, S, R, V, volume up/down)
- [x] Lyrics panel with LRC parser for synced lyrics + plain text fallback
- [x] Equalizer: 5-band parametric EQ with 5 presets (Flat, Bass Boost, Treble Boost, Vocal, Night)
- [x] Sleep timer with 5 presets (15/30/45/60/90 min)
- [x] Mini player: draggable floating `MiniPlayer.tsx` appears when scrolling past PlayerBar — play/pause, next, close; mounted in root layout
- [x] PWA: manifest.json, service worker with cache-first strategy, PwaRegister component

### Gamification
- [x] Badges: 7 types with auto-awarding (first_upload, playlist_curator, century_club, night_owl, genre_explorer, social_butterfly, collaborator)
- [x] Listening streaks with freeze system (currentStreak, longestStreak, streakFreezes on user entity)
- [x] Leaderboards: 3 types (top uploaders, top listeners, trending tracks)
- [x] Challenges: weekly challenges with progress tracking and completion

### Creator Tools
- [x] Artist analytics dashboard (total tracks, total plays, avg plays, top track, per-track performance)
- [x] Embeddable player widget with iframe code generator
- [x] Release scheduling: scheduledReleaseAt + isPublished on tracks, UpcomingReleases on profile
- [x] Countdown timer: `UpcomingReleases` now shows a live ticking countdown (Xd Xh Xm or Xm Xs) next to each scheduled release using a client-side interval
- [x] Artist verification: isVerified on user entity, admin PATCH endpoint, verified badge on profile

---

## Remaining Gaps

None — all planned features implemented.

## Completed Gaps

| # | Item | Implementation |
|---|------|----------------|
| 1 | Daily Mix frontend | `HomeContent` fetches `/playlists/daily-mixes`, renders mix cards for authenticated users |
| 2 | Personalized recommendation context | Each recommendation card shows "Because you like [genre]" or "More from [artist]" |
| 3 | BPM detection | `AudioAnalysisService.detectBpm()` — music-metadata first, ffmpeg onset autocorrelation fallback |
| 4 | Social share cards | `opengraph-image.tsx` in track and playlist routes — dynamic OG images with cover art |
| 5 | Currently listening presence | `PresenceGateway` (WS `/presence`), `usePresence` hook, live indicator on ProfileView |
| 6 | Mini player | Draggable `MiniPlayer.tsx` appears on scroll, play/pause/next/close, mounted in root layout |
| 7 | Countdown timer | Live ticking countdown in `UpcomingReleases` — days/hours/minutes/seconds |
| 8 | Auto-tagging | `AudioAnalysisService.autoTag()` maps BPM + avg energy to genre/mood. Wired into `TracksService.create()`. BPM + mood pills shown on TrackDetail. UploadForm labels fields "auto-tagged if blank" |
