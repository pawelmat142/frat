/** Created by Pawel Malek **/
import { UserI, UserProvider, UserRole, UserStatus, UserStatuses } from '@shared/interfaces/UserI';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('jh_users')
export class UserEntity implements UserI {

  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'uid', unique: true })
  uid: string;

  @Column({ name: 'version', default: 1 })
  version: number;

  @Column({ name: 'status', default: UserStatuses.ACTIVE })
  status: UserStatus;

  @Column({ name: 'roles', type: 'text', array: true, default: () => "ARRAY[]::text[]" })
  roles: UserRole[];

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'email', unique: true })
  email: string;

  @Column({ name: 'verified', default: false })
  verified: boolean;

  @Column({ name: 'provider' })
  provider: UserProvider;

  @Column({ name: 'photo_url', nullable: true })
  photoURL?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
