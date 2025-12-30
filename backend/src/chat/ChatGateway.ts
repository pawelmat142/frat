/** Created by Pawel Malek **/
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ChatService } from './services/ChatService';
import { ExportedAuthService } from 'auth/services/ExportedAuthService';
import { UserI } from '@shared/interfaces/UserI';
import { UserService } from 'user/services/UserService';
import { ChatUtil } from '@shared/utils/ChatUtil';
import { ChatEvents, ChatResponse, JoinChatResponse, SendMessageDto, SendMessageResponse } from '@shared/interfaces/ChatI';

interface AuthenticatedSocket extends Socket {
  user: UserI;
}

@WebSocketGateway({
  cors: {
    origin: '*', // TODO: Configure for production
  },
  namespace: '/api/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  private readonly logger = new Logger(this.constructor.name);

  @WebSocketServer()
  server: Server;

  // Map uid -> socket ids (user can have multiple connections)
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly chatService: ChatService,
    private readonly exportedAuthService: ExportedAuthService,
    private readonly userService: UserService,
  ) {}

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

      // Join user to their personal room for direct messages
      socket.join(ChatUtil.userRoom(user.uid));

      // Join user to all their chat rooms
      const userChats = await this.chatService.getUserChats(user.uid);
      for (const chat of userChats) {
        this.logger.log(`Joining user ${user.uid} to chat room chat:${chat.chatId}`);
        socket.join(ChatUtil.chatRoom(chat.chatId));
      }

      this.logger.log(`User connected: ${user.uid} (socket: ${socket.id})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      socket.disconnect();
    }
  }


  handleDisconnect(socket: AuthenticatedSocket) {
    if (socket.user) {
      const userSocketSet = this.userSockets.get(socket.user.uid);
      if (userSocketSet) {
        userSocketSet.delete(socket.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(socket.user.uid);
        }
      }
      this.logger.log(`User disconnected: ${socket.user.uid} (socket: ${socket.id})`);
    }
  }

  @SubscribeMessage(ChatEvents.SEND_MESSAGE)
  async handleSendMessage(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: SendMessageDto,
  ): Promise<SendMessageResponse> {
    const { chatId, content } = data;
    const senderUid = socket.user.uid;

    this.logger.warn(`Received message from user ${senderUid} to chat ${chatId}`);
    try {
      // Verify user is member of this chat
      const isMember = await this.chatService.isUserMemberOfChat(senderUid, chatId);
      if (!isMember) {
        return { error: 'Not a member of this chat' };
      }

      // Save message to database
      const message = await this.chatService.createMessage(chatId, senderUid, content);

      // Broadcast message to all chat members
      this.server.to(ChatUtil.chatRoom(chatId)).emit(ChatEvents.RECEIVE_MESSAGE, message);

      return { success: true, message };
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      return { error: 'Failed to send message' };
    }
  }

  @SubscribeMessage(ChatEvents.JOIN_CHAT)
  async handleJoinChat(
    @ConnectedSocket() socket: AuthenticatedSocket,
    @MessageBody() data: { chatId: number },
  ): Promise<JoinChatResponse> {
    const { chatId } = data;
    const uid = socket.user.uid;

    this.logger.warn(`User ${uid} requests to join chat ${chatId}`);

    const isMember = await this.chatService.isUserMemberOfChat(uid, chatId);
    if (!isMember) {
      return { error: 'Not a member of this chat' };
    }

    socket.join(ChatUtil.chatRoom(chatId));
    return { success: true };
  }

  // Helper: notify user about new chat (when someone creates direct chat with them)
  notifyUserAboutNewChat(uid: string, chat: ChatResponse): void {
    this.server.to(ChatUtil.userRoom(uid)).emit(ChatEvents.NEW_CHAT, chat);
  }

  private extractToken(socket: Socket): string | null {
    // Try auth header first
    const authHeader = socket.handshake.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    // Try query param as fallback
    return socket.handshake.query.token as string || null;
  }
}
