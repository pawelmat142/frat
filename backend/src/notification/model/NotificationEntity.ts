/** Created by Pawel Malek **/
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { NotificationType, NotificationIcon, NotificationI } from '@shared/interfaces/NotificationI';
import { Expose } from 'class-transformer';

@Entity('jh_notifications')
export class NotificationEntity implements NotificationI {

  @PrimaryGeneratedColumn({ name: 'notification_id' })
  @Expose()
  notificationId: string;
  
  @Column({ name: 'recipient_uid' })
  @Expose()
  recipientUid: string;
  
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