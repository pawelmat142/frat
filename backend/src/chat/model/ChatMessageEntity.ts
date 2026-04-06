/** Created by Pawel Malek **/
import { ChatMessageI, MessageType, MessageTypes } from '@shared/interfaces/ChatI';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ChatEntity } from './ChatEntity';
import { UserEntity } from 'user/model/UserEntity';

@Entity('jh_chat_messages')
export class ChatMessageEntity implements ChatMessageI {

  @PrimaryGeneratedColumn({ name: 'message_id' })
  messageId: number;

  @Column({ name: 'type', default: MessageTypes.TEXT })
  type: MessageType;

  @Column({ name: 'chat_id' })
  chatId: number;

  @Column({ name: 'sender_uid' })
  senderUid: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt: Date | null;

  @ManyToOne(() => ChatEntity, (chat) => chat.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: ChatEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_uid', referencedColumnName: 'uid' })
  sender: UserEntity;
}
