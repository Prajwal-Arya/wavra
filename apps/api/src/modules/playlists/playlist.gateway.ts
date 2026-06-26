import { Logger } from "@nestjs/common";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";

@WebSocketGateway({ namespace: "playlists", cors: { origin: true, credentials: true } })
export class PlaylistGateway {
  @WebSocketServer()
  private server!: Server;

  private readonly logger = new Logger(PlaylistGateway.name);

  @SubscribeMessage("playlist:join")
  joinPlaylist(@MessageBody() playlistId: string, @ConnectedSocket() socket: Socket) {
    if (!playlistId) return;
    void socket.join(this.room(playlistId));
    this.logger.debug(`Socket ${socket.id} joined playlist ${playlistId}`);
    return { playlistId };
  }

  @SubscribeMessage("playlist:leave")
  leavePlaylist(@MessageBody() playlistId: string, @ConnectedSocket() socket: Socket) {
    if (!playlistId) return;
    void socket.leave(this.room(playlistId));
    return { playlistId };
  }

  playlistUpdated(playlistId: string, payload: unknown) {
    this.server?.to(this.room(playlistId)).emit("playlist:updated", payload);
  }

  private room(playlistId: string) {
    return `playlist:${playlistId}`;
  }
}
