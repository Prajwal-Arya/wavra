import { OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import type { Server, Socket } from "socket.io";

interface PresenceEntry {
  userId: string;
  trackId: string;
  title: string;
  artist: string;
  startedAt: number;
}

@WebSocketGateway({ cors: { origin: true, credentials: true }, namespace: "presence" })
export class PresenceGateway implements OnGatewayDisconnect {
  @WebSocketServer() server!: Server;

  // userId -> presence entry
  private presence = new Map<string, PresenceEntry>();
  // socketId -> userId
  private socketToUser = new Map<string, string>();

  @SubscribeMessage("presence:update")
  handleUpdate(client: Socket, payload: { userId: string; trackId: string; title: string; artist: string }) {
    const entry: PresenceEntry = { ...payload, startedAt: Date.now() };
    this.presence.set(payload.userId, entry);
    this.socketToUser.set(client.id, payload.userId);
    this.server.emit("presence:updated", entry);
  }

  @SubscribeMessage("presence:clear")
  handleClear(client: Socket, payload: { userId: string }) {
    this.presence.delete(payload.userId);
    this.socketToUser.set(client.id, payload.userId);
    this.server.emit("presence:cleared", { userId: payload.userId });
  }

  @SubscribeMessage("presence:get")
  handleGet(_client: Socket, payload: { userId: string }) {
    return this.presence.get(payload.userId) ?? null;
  }

  handleDisconnect(client: Socket) {
    const userId = this.socketToUser.get(client.id);
    if (userId) {
      this.presence.delete(userId);
      this.socketToUser.delete(client.id);
      this.server.emit("presence:cleared", { userId });
    }
  }

  getPresence(userId: string): PresenceEntry | null {
    return this.presence.get(userId) ?? null;
  }
}
