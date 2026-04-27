
/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import { ChatEntity } from '../model/ChatEntity';
import { ChatMemberEntity } from '../model/ChatMemberEntity';
import { ChatMessageEntity } from '../model/ChatMessageEntity';
import { ChatI, ChatMemberStatuses, MessageTypes } from '@shared/interfaces/ChatI';
import { AvatarRef } from '@shared/interfaces/UserI';

@Injectable()
export class ChatRepo {

  /**
   * Sets all member statuses from OPEN to LEFT for the given user in all chats (single query).
   */
  async leaveAllOpenChatsForUser(uid: string): Promise<void> {
    await this.memberRepository
      .createQueryBuilder()
      .update()
      .set({ status: ChatMemberStatuses.LEFT })
      .where('uid = :uid', { uid })
      .andWhere('status = :openStatus', { openStatus: ChatMemberStatuses.OPEN })
      .execute();
  }

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
      .innerJoin('chat.members', 'member1', 'member1.uid = :uid1', { uid1 })
      .innerJoin('chat.members', 'member2', 'member2.uid = :uid2', { uid2 })
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
  async createMessage(
    chatId: number,
    senderUid: string,
    content: string,
    imageRefs?: AvatarRef[],
  ): Promise<ChatMessageEntity> {
    const message = this.messageRepository.create({
      chatId,
      senderUid,
      content,
      type: imageRefs?.length ? MessageTypes.IMAGE : MessageTypes.TEXT,
      imageRefs: imageRefs?.length ? imageRefs : null,
    });
    return this.messageRepository.save(message);
  }

  /**
   * Increments unreadCount for all members of the chat except the sender.
   */
  incrementUnreadForMembersExceptSender(chatId: number, senderUid: string): Promise<UpdateResult> {
    // Inkrementuj unreadCount tylko dla członków ze statusem 'LEFT', poza nadawcą
    return this.memberRepository
      .createQueryBuilder()
      .update()
      .set({ unreadCount: () => 'unread_count + 1' })
      .where('chat_id = :chatId', { chatId })
      .andWhere('uid != :senderUid', { senderUid })
      .andWhere('status = :leftStatus', { leftStatus: ChatMemberStatuses.LEFT })
      .execute();
  }

  updateLatestMessageContent(chatId: number, content: string): Promise<UpdateResult> {
    return this.chatRepository
      .createQueryBuilder()
      .update(ChatEntity)
      .set({ latestMessageContent: content })
      .where("chatId = :chatId", { chatId })
      .execute()
  }

  resetUnreadCountForMembers(chatId: number): Promise<UpdateResult> {
    return this.memberRepository
      .createQueryBuilder()
      .update()
      .set({ unreadCount: 0 })
      .where('chat_id = :chatId', { chatId })
      .execute();
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

  deleteAllMessagesFromChat(chatId: number): Promise<DeleteResult> {
    return this.messageRepository
      .createQueryBuilder()
      .delete()
      .from(ChatMessageEntity)
      .where('chatId = :chatId', { chatId })
      .execute()
  }

  async deleteMessage(messageId: number): Promise<void> {
    await this.messageRepository.delete({ messageId });
  }

  /**
   * Ustawia status członka czatu na 'LEFT' gdy opuszcza czat.
   */
  leaveChat(uid: string, chatId: number): Promise<UpdateResult> {
    return this.memberRepository
      .createQueryBuilder()
      .update()
      .set({ status: ChatMemberStatuses.LEFT })
      .where('chat_id = :chatId', { chatId })
      .andWhere('uid = :uid', { uid })
      .execute();
  }

  /**
   * Resetuje licznik nieprzeczytanych wiadomości dla użytkownika w czacie.
   */
  openChatAnd(chatId: number, uid: string): Promise<UpdateResult> {
    return this.memberRepository
      .createQueryBuilder()
      .update()
      .set({ unreadCount: 0, status: ChatMemberStatuses.OPEN })
      .where('chat_id = :chatId', { chatId })
      .andWhere('uid = :uid', { uid })
      .execute();
  }

  /**
   * Ustawia readAt dla wszystkich wiadomości w czacie.
   */
  markMessageAsRead(chatId: number): Promise<UpdateResult> {
     return this.messageRepository
      .createQueryBuilder()
      .update()
      .set({ readAt: () => 'CURRENT_TIMESTAMP' })
      .where('chat_id = :chatId', { chatId })
      .andWhere('read_at IS NULL')
      .execute();
  }

  blockChat(chatId: number, blockedByUid: string): Promise<UpdateResult> {
    return this.chatRepository.update(
      { chatId },
      { blockedByUid }
    );
  }

  deleteChat(chatId: number): Promise<DeleteResult> {
    return this.chatRepository.delete({ chatId });
  }
}
