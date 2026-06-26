import { io } from "socket.io-client";
import { getApiBaseUrl } from "@/lib/api";

export function createPlaylistSocket() {
  const origin = getApiBaseUrl().replace(/\/api$/, "");
  return io(`${origin}/playlists`, { withCredentials: true, transports: ["websocket", "polling"] });
}
