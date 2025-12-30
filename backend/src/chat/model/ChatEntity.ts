/** Created by Pawel Malek **/
import { ChatI, ChatType, ChatTypes } from '@shared/interfaces/ChatI';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, UpdateDateColumn } from 'typeorm';
import { ChatMemberEntity } from './ChatMemberEntity';
import { ChatMessageEntity } from './ChatMessageEntity';

@Entity('jh_chats')
export class ChatEntity implements ChatI {

  @PrimaryGeneratedColumn({ name: 'chat_id' })
  chatId: number;

  @Column({ name: 'type', default: ChatTypes.DIRECT })
  type: ChatType;

  @Column({ name: 'blocked_by_uid', type: 'varchar', nullable: true })
  blockedByUid?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ChatMemberEntity, (member) => member.chat)
  members: ChatMemberEntity[];

  @OneToMany(() => ChatMessageEntity, (message) => message.chat)
  messages: ChatMessageEntity[];
}
