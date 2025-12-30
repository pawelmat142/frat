/** Created by Pawel Malek **/
import { ChatMemberI } from '@shared/interfaces/ChatI';
import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { ChatEntity } from './ChatEntity';
import { UserEntity } from 'user/model/UserEntity';

@Entity('jh_chat_members')
export class ChatMemberEntity implements ChatMemberI {

  @PrimaryColumn({ name: 'chat_id' })
  chatId: number;

  @PrimaryColumn({ name: 'uid' })
  uid: string;

  @CreateDateColumn({ name: 'joined_at' })
  joinedAt: Date;

  @Column({ name: 'unread_count', type: 'int', default: 0 })
  unreadCount: number;

  @ManyToOne(() => ChatEntity, (chat) => chat.members, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chat_id' })
  chat: ChatEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'uid', referencedColumnName: 'uid' })
  user: UserEntity;
}
