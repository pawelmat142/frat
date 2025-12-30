
/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity } from '../model/ChatEntity';
import { ChatMemberEntity } from '../model/ChatMemberEntity';
import { ChatMessageEntity } from '../model/ChatMessageEntity';
import { ChatI } from '@shared/interfaces/ChatI';

@Injectable()
export class ChatRepo {

  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(ChatEntity)
    private readonly chatRepository: Repository<ChatEntity>,
    @InjectRepository(ChatMemberEntity)
    private readonly memberRepository: Repository<ChatMemberEntity>,
    @InjectRepository(ChatMessageEntity)
    private readonly messageRepository: Repository<ChatMessageEntity>,
  ) { }

  // Chat operations
  async createChat(type: string): Promise<ChatI> {
    const chat = this.chatRepository.create({ type } as ChatEntity);
    return this.chatRepository.save(chat);
  }

  async findChat(chatId: number): Promise<ChatI | null> {
    return this.chatRepository.findOne({
      where: { chatId },
      relations: ['members'],
    });
  }

  async getChatWithMembersWithUsers(chatId: number): Promise<ChatEntity | null> {
    return this.chatRepository.findOne({
      where: { chatId },
      relations: ['members', 'members.user'],
    });
  }

  async findDirectChatBetweenUsers(uid1: string, uid2: string): Promise<ChatI | null> {
    const result = await this.chatRepository
      .createQueryBuilder('chat')
      .where('chat.type = :type', { type: 'DIRECT' })
      .getOne();

    return result;
  }

  async getUserChats(uid: string): Promise<ChatEntity[]> {
    return this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.members', 'member', 'member.uid = :uid', { uid })
      .leftJoinAndSelect('chat.members', 'allMembers')
      .leftJoinAndSelect('allMembers.user', 'user')
      .orderBy('chat.createdAt', 'DESC')
      .getMany();
  }

  async getUserChatsWithoutJoins(uid: string): Promise<ChatI[]> {
    return this.chatRepository
      .createQueryBuilder('chat')
      .orderBy('chat.createdAt', 'DESC')
      .getMany();
  }


  // Member operations
  async addMember(chatId: number, uid: string): Promise<ChatMemberEntity> {
    const member = this.memberRepository.create({ chatId, uid });
    return this.memberRepository.save(member);
  }

  async isMember(chatId: number, uid: string): Promise<boolean> {
    const count = await this.memberRepository.count({
      where: { chatId, uid },
    });
    return count > 0;
  }

  // Message operations
  async createMessage(chatId: number, senderUid: string, content: string): Promise<ChatMessageEntity> {
    const message = this.messageRepository.create({
      chatId,
      senderUid,
      content,
    });
    return this.messageRepository.save(message);
  }

  /**
 * Increments unreadCount for all members of the chat except the sender.
 */
  async incrementUnreadForMembersExceptSender(chatId: number, senderUid: string): Promise<void> {
    await this.memberRepository
      .createQueryBuilder()
      .update()
      .set({ unreadCount: () => 'unread_count + 1' })
      .where('chat_id = :chatId', { chatId })
      .andWhere('uid != :senderUid', { senderUid })
      .execute();
  }

  updateLatestMessageContent(chatId: number, content: string): Promise<void> {
    return this.chatRepository
      .createQueryBuilder()
      .update(ChatEntity)
      .set({ latestMessageContent: content })
      .where("chatId = :chatId", { chatId })
      .execute()
      .then(() => { });
  }

  async getChatMessages(chatId: number, limit = 50, offset = 0): Promise<ChatMessageEntity[]> {
    return this.messageRepository.find({
      where: { chatId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getMessageById(messageId: number): Promise<ChatMessageEntity | null> {
    return this.messageRepository.findOne({
      where: { messageId },
      relations: ['sender'],
    });
  }

  deleteAllMessagesFromChat(chatId: number): Promise<void> {
    return this.messageRepository
      .createQueryBuilder()
      .delete()
      .from(ChatMessageEntity)
      .where('chatId = :chatId', { chatId })
      .execute()
      .then(() => { });
  }

  /**
 * Resetuje licznik nieprzeczytanych wiadomości dla użytkownika w czacie.
 */
  async resetUnreadCount(chatId: number, uid: string): Promise<void> {
    // Resetuj licznik nieprzeczytanych wiadomości dla użytkownika w czacie
    await this.memberRepository
      .createQueryBuilder()
      .update()
      .set({ unreadCount: 0 })
      .where('chat_id = :chatId', { chatId })
      .andWhere('uid = :uid', { uid })
      .execute();

    // Oznacz wszystkie wiadomości w czacie jako przeczytane (readAt = now), jeśli nie były przeczytane
    await this.messageRepository
      .createQueryBuilder()
      .update()
      .set({ readAt: () => 'CURRENT_TIMESTAMP' })
      .where('chat_id = :chatId', { chatId })
      .andWhere('read_at IS NULL')
      .execute();
  }

  async blockChat(chatId: number, blockedByUid: string): Promise<void> {
    await this.chatRepository.update(
      { chatId },
      { blockedByUid }
    );
  }

  async deleteChat(chatId: number): Promise<void> {
    await this.chatRepository.delete({ chatId });
  }
}
