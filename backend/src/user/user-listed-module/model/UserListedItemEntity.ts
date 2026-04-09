/** Created by Pawel Malek **/
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ListedItemNote, UserListedItem, UserListedItemReferenceType, UserListedItemType } from '@shared/interfaces/UserListedItem';
import { UserEntity } from 'user/model/UserEntity';

@Entity('jh_user_listed_items')
export class UserListedItemEntity implements UserListedItem {

    @PrimaryGeneratedColumn({ name: 'id' })
    id: number;

    @Column({ name: 'uid' })
    uid: string;

    @Column({ name: 'reference' })
    reference: string;

    @Column({ name: 'reference_type', type: 'varchar', length: 20 })
    referenceType: UserListedItemReferenceType;

    @Column({ name: 'listed_type', type: 'varchar', length: 20 })
    listedType: UserListedItemType;

    @Column({ name: 'data', type: 'jsonb', nullable: true, default: null })
    data?: any;

    @CreateDateColumn({ name: 'listed_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    listedAt: Date;

    @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'uid', referencedColumnName: 'uid' })
    user: UserEntity;

    @Column({ name: 'notes', type: 'jsonb', nullable: true, default: null })
    notes?: ListedItemNote[]
    
}
