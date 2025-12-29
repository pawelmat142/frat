/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { ChatRepo } from './ChatRepo';
import { ChatEntity } from '../model/ChatEntity';
import { ChatMessageEntity } from '../model/ChatMessageEntity';
import { ChatTypes } from '@shared/interfaces/ChatI';
import { ToastException } from 'global/exceptions/ToastException';
import { UserService } from 'user/services/UserService';

@Injectable()
export class ChatService {

  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly chatRepo: ChatRepo,
    private readonly userService: UserService,
  ) {}

  async getOrCreateDirectChat(initiatorUid: string, recipientUid: string): Promise<ChatEntity> {
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

    // Return chat with members loaded
    return this.chatRepo.findChatById(chat.chatId);
  }

  async getChatById(chatId: number, userUid: string): Promise<ChatEntity> {
    const chat = await this.chatRepo.findChatById(chatId);
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

  async createMessage(chatId: number, senderUid: string, content: string): Promise<ChatMessageEntity> {
    if (!content?.trim()) {
      throw new ToastException('chat.error.emptyMessage', this);
    }

    const message = await this.chatRepo.createMessage(chatId, senderUid, content.trim());
    
    // Load sender relation for response
    return this.chatRepo.getMessageById(message.messageId);
  }

  async getChatMessages(chatId: number, userUid: string, limit = 50, offset = 0): Promise<ChatMessageEntity[]> {
    // Verify user is member
    const isMember = await this.chatRepo.isMember(chatId, userUid);
    if (!isMember) {
      throw new ToastException('chat.error.notMember', this);
    }

    const messages = await this.chatRepo.getChatMessages(chatId, limit, offset);
    // Reverse to get chronological order (oldest first)
    return messages.reverse();
  }
}
