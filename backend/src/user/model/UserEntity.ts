/** Created by Pawel Malek **/
import { AvatarRef, UserI, UserProvider, UserRole, UserStatus, UserStatuses } from '@shared/interfaces/UserI';
import { Expose } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('jh_users')
export class UserEntity implements UserI {

  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'uid', unique: true })
  @Expose()
  uid: string;
  
  @Column({ name: 'version', default: 1 })
  version: number;
  
  @Column({ name: 'status', default: UserStatuses.ACTIVE })
  @Expose()
  status: UserStatus;
  
  @Column({ name: 'roles', type: 'text', array: true, default: () => "ARRAY[]::text[]" })
  @Expose()
  roles: UserRole[];
  
  @Column({ name: 'display_name' })
  @Expose()
  displayName: string;
  
  @Column({ name: 'email', unique: true })
  @Expose()
  email: string;
  
  @Column({ name: 'telegram_channel_id', unique: true, nullable: true })
  @Expose()
  telegramChannelId?: string;
  
  @Column({ name: 'telegram_username', nullable: true, default: null })
  @Expose()
  telegramUsername?: string;
  
  @Column({ name: 'verified', default: false })
  @Expose()
  verified: boolean;
  
  @Column({ name: 'provider' })
  @Expose()
  provider: UserProvider;

  @Column({ name: 'photo_url', nullable: true })
  @Expose()
  photoURL?: string;

  @Column({ name: 'avatar_ref', type: 'jsonb', nullable: true })
  @Expose()
  avatarRef?: AvatarRef;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_seen_at', nullable: true })
  @Expose()
  lastSeenAt?: Date;
}
