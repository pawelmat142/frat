/** Created by Pawel Malek **/
import { ChatI, ChatType, ChatTypes } from '@shared/interfaces/ChatI';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { ChatMemberEntity } from './ChatMemberEntity';
import { ChatMessageEntity } from './ChatMessageEntity';

@Entity('jh_chats')
export class ChatEntity implements ChatI {

  @PrimaryGeneratedColumn({ name: 'chat_id' })
  chatId: number;

  @Column({ name: 'type', default: ChatTypes.DIRECT })
  type: ChatType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => ChatMemberEntity, (member) => member.chat)
  members: ChatMemberEntity[];

  @OneToMany(() => ChatMessageEntity, (message) => message.chat)
  messages: ChatMessageEntity[];
}
