/** Created by Pawel Malek **/
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChatService } from './ChatService';
import { SocketGateway } from 'global/web-socket/SocketGateway';
import { SocketHandler } from 'global/web-socket/SocketHandler';
import { AuthenticatedSocket } from 'global/web-socket/AuthenticatedSocket';
import { ChatUtil } from '@shared/utils/ChatUtil';
import { ChatEvents, ChatI, DeleteMessageDto, DeleteMessageResponse, JoinChatResponse, SendMessageDto, SendMessageResponse } from '@shared/interfaces/ChatI';

@Injectable()
export class ChatSocketHandler implements SocketHandler, OnModuleInit {

  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly chatService: ChatService,
    private readonly socketGateway: SocketGateway,
  ) {}

  onModuleInit(): void {
    this.socketGateway.registerHandler(this);
  }

  async onConnect(socket: AuthenticatedSocket): Promise<void> {
    const uid = socket.user.uid;
    const userChats = await this.chatService.getUserChats(uid);
    for (const chat of userChats) {
      this.logger.log(`Joining user ${uid} to chat room chat:${chat.chatId}`);
      socket.join(ChatUtil.chatRoom(chat.chatId));
    }

    // Register chat-specific socket event listeners
    socket.on(ChatEvents.SEND_MESSAGE, (data: SendMessageDto, callback: (res: SendMessageResponse) => void) => {
      this.handleSendMessage(socket, data).then(callback);
    });

    socket.on(ChatEvents.OPEN_CHAT, (data: { chatId: number }, callback: (res: JoinChatResponse) => void) => {
      this.handleOpenChat(socket, data).then(callback);
    });

    socket.on(ChatEvents.LEAVE_CHAT, (data: { chatId: number }, callback: (res: JoinChatResponse) => void) => {
      this.handleLeaveChat(socket, data).then(callback);
    });

    socket.on(ChatEvents.DELETE_MESSAGE, (data: DeleteMessageDto, callback: (res: DeleteMessageResponse) => void) => {
      this.handleDeleteMessage(socket, data).then(callback);
    });
  }

  async onFullDisconnect(uid: string): Promise<void> {
    await this.chatService.leaveAllOpenChatsForUser(uid);
  }

  private async handleSendMessage(socket: AuthenticatedSocket, data: SendMessageDto): Promise<SendMessageResponse> {
    const { chatId, content, imageRefs } = data;
    const senderUid = socket.user.uid;

    this.logger.warn(`Received message from user ${senderUid} to chat ${chatId}`);
    try {
      const isMember = await this.chatService.isUserMemberOfChat(senderUid, chatId);
      if (!isMember) {
        return { error: 'Not a member of this chat' };
      }

      const message = await this.chatService.createMessage(chatId, senderUid, content, imageRefs);

      const chat = await this.chatService.findChat(chatId);
      this.notifyAboutRefreshChat(chat);

      this.socketGateway.emitToRoom(ChatUtil.chatRoom(chatId), ChatEvents.RECEIVE_MESSAGE, message);

      return { success: true, message };
    } catch (error) {
      this.logger.error(`Send message error: ${error instanceof Error ? error.message : String(error)}`);
      return { error: 'Failed to send message' };
    }
  }

  private async handleOpenChat(socket: AuthenticatedSocket, data: { chatId: number }): Promise<JoinChatResponse> {
    const { chatId } = data;
    const uid = socket.user.uid;

    this.logger.warn(`User ${uid} requests to open chat ${chatId}`);

    const isMember = await this.chatService.isUserMemberOfChat(uid, chatId);
    if (!isMember) {
      return { error: 'Not a member of this chat' };
    }

    const chat = await this.chatService.openChatAndMarkMessages(uid, chatId);
    this.notifyAboutRefreshChat(chat);
    socket.join(ChatUtil.chatRoom(chatId));
    return { success: true };
  }

  private async handleLeaveChat(socket: AuthenticatedSocket, data: { chatId: number }): Promise<JoinChatResponse> {
    const { chatId } = data;
    const uid = socket.user.uid;
    this.logger.warn(`User ${uid} requests to leave chat ${chatId}`);

    const isMember = await this.chatService.isUserMemberOfChat(uid, chatId);
    if (!isMember) {
      return { error: 'Not a member of this chat' };
    }

    const chat = await this.chatService.leaveChat(uid, chatId);
    this.notifyAboutRefreshChat(chat);
    return { success: true };
  }

  private async handleDeleteMessage(socket: AuthenticatedSocket, data: DeleteMessageDto): Promise<DeleteMessageResponse> {
    const { messageId, chatId } = data;
    const uid = socket.user.uid;
    try {
      await this.chatService.deleteMessage(messageId, uid);
      this.socketGateway.emitToRoom(ChatUtil.chatRoom(chatId), ChatEvents.MESSAGE_DELETED, { messageId, chatId });
      return { success: true, messageId };
    } catch (error) {
      this.logger.error(`Delete message error: ${error instanceof Error ? error.message : String(error)}`);
      return { error: 'Failed to delete message' };
    }
  }

  /**
   * Notify a specific user about a new chat and join their socket(s) to the chat room.
   * Must be called for every participant when a chat is created after they connected.
   */
  notifyUserAboutNewChat(uid: string, chat: ChatI): void {
    this.socketGateway.joinUserToRoom(uid, ChatUtil.chatRoom(chat.chatId));
    this.socketGateway.emitToUser(uid, ChatEvents.LOAD_CHAT, chat);
  }

  notifyAboutRefreshChat(chat: ChatI): void {
    this.socketGateway.emitToRoom(ChatUtil.chatRoom(chat.chatId), ChatEvents.LOAD_CHAT, chat);
  }

  notifyAboutDeleteChat(chatId: number): void {
    this.socketGateway.emitToRoom(ChatUtil.chatRoom(chatId), ChatEvents.LOAD_CHAT, null);
  }
}
