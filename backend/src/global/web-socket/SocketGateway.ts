/** Created by Pawel Malek **/
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ExportedAuthService } from 'auth/services/ExportedAuthService';
import { UserService } from 'user/services/UserService';
import { AuthenticatedSocket } from './AuthenticatedSocket';
import { SocketHandler } from './SocketHandler';
import { SocketUtil } from '@shared/utils/SocketUtil';

@WebSocketGateway({
  cors: {
    origin: '*', // TODO: Configure for production
  },
  path: '/socket',
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {

  private readonly logger = new Logger(this.constructor.name);

  @WebSocketServer()
  server: Server;

  // uid -> socket ids (user can have multiple connections)
  private userSockets = new Map<string, Set<string>>();

  // Feature-specific handlers registered at runtime
  private handlers: SocketHandler[] = [];

  constructor(
    private readonly exportedAuthService: ExportedAuthService,
    private readonly userService: UserService,
  ) {}

  /** Register a feature-specific handler (called from feature modules on init) */
  registerHandler(handler: SocketHandler): void {
    this.handlers.push(handler);
    this.logger.log(`Registered socket handler: ${handler.constructor.name}`);
  }

  async handleConnection(socket: AuthenticatedSocket) {
    this.logger.warn(`New connection attempt (socket: ${socket.id})`);
    try {
      const token = this.extractToken(socket);
      if (!token) {
        this.logger.warn(`Connection rejected - no token`);
        socket.disconnect();
        return;
      }

      const decodedToken = await this.exportedAuthService.verifyIdToken(token);
      const user = await this.userService.getActiveUserByUid(decodedToken.uid);

      if (!user) {
        this.logger.warn(`Connection rejected - user not found`);
        socket.disconnect();
        this.logger.warn(`Disconnected socket ${socket.id} due to invalid user`);
        return;
      }

      socket.user = user;

      // Track user's socket connections
      if (!this.userSockets.has(user.uid)) {
        this.userSockets.set(user.uid, new Set());
      }
      this.userSockets.get(user.uid)!.add(socket.id);

      // Join personal room for direct notifications
      socket.join(SocketUtil.userRoom(user.uid));

      // Notify all registered handlers
      for (const handler of this.handlers) {
        await handler.onConnect(socket);
      }

      this.logger.log(`User connected: ${user.uid} (socket: ${socket.id})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error instanceof Error ? error.message : String(error)}`);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: AuthenticatedSocket) {
    if (!socket.user) return;

    const uid = socket.user.uid;
    const userSocketSet = this.userSockets.get(uid);

    if (userSocketSet) {
      userSocketSet.delete(socket.id);
      if (userSocketSet.size === 0) {
        this.userSockets.delete(uid);

        // Notify handlers only when user has no remaining sockets
        for (const handler of this.handlers) {
          handler.onFullDisconnect(uid).catch((err) =>
            this.logger.error(`Handler disconnect error: ${err instanceof Error ? err.message : String(err)}`),
          );
        }
      }
    }

    this.logger.log(`User disconnected: ${uid} (socket: ${socket.id})`);
  }

  /** Emit event to a specific user's personal room */
  emitToUser(uid: string, event: string, data: unknown): void {
    this.server.to(SocketUtil.userRoom(uid)).emit(event, data);
  }

  /** Emit event to a named room */
  emitToRoom(room: string, event: string, data: unknown): void {
    this.server.to(room).emit(event, data);
  }

  private extractToken(socket: Socket): string | null {
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return (socket.handshake.auth?.token as string)
      || (socket.handshake.query?.token as string)
      || null;
  }
}
