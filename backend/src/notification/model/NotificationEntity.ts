/** Created by Pawel Malek **/
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { NotificationType, NotificationIcon, NotificationI } from '@shared/interfaces/NotificationI';
import { Expose } from 'class-transformer';
import { FileRef } from '@shared/interfaces/UserI';
import { UserEntity } from 'user/model/UserEntity';

@Entity('jh_notifications')
export class NotificationEntity implements NotificationI {

  @PrimaryGeneratedColumn({ name: 'notification_id' })
  @Expose()
  notificationId: number;

  @Column({ name: 'recipient_uid' })
  @Expose()
  recipientUid: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_uid', referencedColumnName: 'uid' })
  recipient: UserEntity;
  
  @Column({ name: 'type' })
  @Expose()
  type: NotificationType;

  @Column({ name: 'target_id' })
  @Expose()
  targetId: string;

  @Column({ name: 'title' })
  @Expose()
  title: string;

  @Column({ name: 'message' })
  @Expose()
  message: string;

  @Column({ name: 'message_params', type: 'jsonb', nullable: true })
  @Expose()
  messageParams?: Record<string, string>;

  @Column({ name: 'icon' })
  @Expose()
  icon: NotificationIcon;

  @Column({ name: 'avatar_ref', type: 'jsonb', nullable: true })
  @Expose()
  avatarRef?: FileRef;

  @Column({ name: 'requester_uid', nullable: true })
  @Expose()
  requesterUid?: string

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'requester_uid', referencedColumnName: 'uid' })
  requester?: UserEntity;

  @Column({ name: 'requester_name', nullable: true })
  @Expose()
  requesterName?: string

  @CreateDateColumn({ name: 'created_at', type: 'timestamp'  })
  @Expose()
  createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  @Expose()
  updatedAt: Date;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  @Expose()
  readAt: Date | null;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  @Expose()
  metadata?: Record<string, any>;

}