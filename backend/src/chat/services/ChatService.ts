/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { ChatRepo } from './ChatRepo';
import { ChatEntity } from '../model/ChatEntity';
import { ChatI, ChatTypes, ChatMessageI } from '@shared/interfaces/ChatI';
import { ToastException } from 'global/exceptions/ToastException';
import { UserService } from 'user/services/UserService';
import { ApiResponse } from '@shared/dto/dtos';

@Injectable()
export class ChatService {

  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly chatRepo: ChatRepo,
    private readonly userService: UserService,
  ) { }

  async getOrCreateDirectChat(initiatorUid: string, recipientUid: string): Promise<ChatI> {
    // Validate recipient exists
    const recipientExists = await this.userService.existsByUid(recipientUid);
    if (!recipientExists) {
      throw new ToastException('chat.error.recipientNotFound', this);
    }

    // Cannot create chat with yourself
    if (initiatorUid === recipientUid) {
      throw new ToastException('chat.error.cannotChatWithYourself', this);
    }

    // Check if direct chat already exists
    const existingChat = await this.chatRepo.findDirectChatBetweenUsers(initiatorUid, recipientUid);
    if (existingChat) {
      return existingChat;
    }

    // Create new direct chat
    const chat = await this.chatRepo.createChat(ChatTypes.DIRECT);

    // Add both users as members
    await this.chatRepo.addMember(chat.chatId, initiatorUid);
    await this.chatRepo.addMember(chat.chatId, recipientUid);

    this.logger.log(`Created direct chat ${chat.chatId} between ${initiatorUid} and ${recipientUid}`);
    return this.chatRepo.findChat(chat.chatId);
  }


  async getChatWithMembersWithUsers(chatId: number, userUid: string): Promise<ChatEntity> {
    const chat = await this.chatRepo.getChatWithMembersWithUsers(chatId);
    if (!chat) {
      throw new ToastException('chat.error.notFound', this);
    }

    // Verify user is member
    const isMember = await this.chatRepo.isMember(chatId, userUid);
    if (!isMember) {
      throw new ToastException('chat.error.notMember', this);
    }

    return chat;
  }

  async getUserChats(uid: string): Promise<ChatEntity[]> {
    return this.chatRepo.getUserChats(uid);
  }

  async isUserMemberOfChat(uid: string, chatId: number): Promise<boolean> {
    return this.chatRepo.isMember(chatId, uid);
  }

  async createMessage(chatId: number, senderUid: string, content: string): Promise<ChatMessageI> {
    if (!content?.trim()) {
      throw new ToastException('chat.error.emptyMessage', this);
    }

    const message = await this.chatRepo.createMessage(chatId, senderUid, content.trim());
    await this.chatRepo.updateLatestMessageContent(chatId, message.content);
    // Inkrementuj unreadCount dla wszystkich poza nadawcą
    await this.chatRepo.incrementUnreadForMembersExceptSender(chatId, senderUid);
    return message;
  }

  async getChatMessages(chatId: number, userUid: string, limit = 50, offset = 0): Promise<ChatMessageI[]> {
    await this.validateMembership(userUid, chatId);

    const messages = await this.chatRepo.getChatMessages(chatId, limit, offset);
    // Reverse to get chronological order (oldest first)
    return messages.reverse();
  }

  public async validateMembership(uid: string, chatId: number) {
    const isMember = await this.chatRepo.isMember(chatId, uid);
    if (!isMember) {
      throw new ToastException('chat.error.notMember', this);
    }
  }

  async markMessagesReadWhenJoinChat(uid: string, chatId: number): Promise<ChatI> {
    await this.chatRepo.resetUnreadCount(chatId, uid);
    return this.chatRepo.findChat(chatId);
  }



  async cleanChat(uid: string, chatId: number): Promise<ChatI> {
    await this.validateMembership(uid, chatId);
    // Usuń wszystkie wiadomości z chatu
    await this.chatRepo.deleteAllMessagesFromChat(chatId);
    await this.chatRepo.updateLatestMessageContent(chatId, null);
    this.logger.log(`User ${uid} cleaned chat history for chat ${chatId}`);
    return this.findChat(chatId);
  }

  async blockChat(uid: string, chatId: number): Promise<ChatI> {
    await this.validateMembership(uid, chatId);
    // Set blocked flag and blockedByUid in chat entity
    await this.chatRepo.blockChat(chatId, uid);
    this.logger.log(`User ${uid} blocked chat ${chatId}`);
    return this.findChat(chatId);
  }

  async unblockChat(uid: string, chatId: number): Promise<ChatI> {
    await this.validateMembership(uid, chatId);
    // Remove blocked flag and blockedByUid in chat entity
    await this.chatRepo.blockChat(chatId, null);
    this.logger.log(`User ${uid} unblocked chat ${chatId}`);
    return this.findChat(chatId);
  }

  async deleteChat(uid: string, chatId: number): Promise<ApiResponse> {
    await this.validateMembership(uid, chatId);
    // Delete chat itself
    await this.chatRepo.deleteChat(chatId);
    this.logger.log(`User ${uid} deleted chat ${chatId}`);
    return { success: true }
  }

    findChat(chatId: number): Promise<ChatI> {
    return this.chatRepo.findChat(chatId);
  }
}
