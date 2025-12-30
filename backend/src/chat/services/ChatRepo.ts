/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity } from '../model/ChatEntity';
import { ChatMemberEntity } from '../model/ChatMemberEntity';
import { ChatMessageEntity } from '../model/ChatMessageEntity';

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
  async createChat(type: string): Promise<ChatEntity> {
    const chat = this.chatRepository.create({ type } as ChatEntity);
    return this.chatRepository.save(chat) as Promise<ChatEntity>;
  }

  async findChatById(chatId: number): Promise<ChatEntity | null> {
    return this.chatRepository.findOne({
      where: { chatId },
      relations: ['members', 'members.user'],
    });
  }

  async findDirectChatBetweenUsers(uid1: string, uid2: string): Promise<ChatEntity | null> {
    // Find a DIRECT chat where both users are members
    const result = await this.chatRepository
      .createQueryBuilder('chat')
      .innerJoin('chat.members', 'm1', 'm1.uid = :uid1', { uid1 })
      .innerJoin('chat.members', 'm2', 'm2.uid = :uid2', { uid2 })
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

  async getChatMessages(chatId: number, limit = 50, offset = 0): Promise<ChatMessageEntity[]> {
    return this.messageRepository.find({
      where: { chatId },
      relations: ['sender'],
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
