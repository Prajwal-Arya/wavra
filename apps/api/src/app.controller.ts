import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  health() {
    return {
      name: "music-player-api",
      status: "ok",
      routes: {
        auth: "/api/auth",
        tracks: "/api/tracks",
        playlists: "/api/playlists",
        search: "/api/search"
      }
    };
  }
}
