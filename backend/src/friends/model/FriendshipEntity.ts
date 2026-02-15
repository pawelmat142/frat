/** Created by Pawel Malek **/
import { FriendshipI, FriendshipStatus, FriendshipStatuses } from '@shared/interfaces/FriendshipI';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('jh_friendships')
@Unique(['requesterUid', 'addresseeUid'])
export class FriendshipEntity implements FriendshipI {


    @PrimaryGeneratedColumn({ name: 'friendship_id' })
    friendshipId: number;

    @Column({ name: 'requester_uid' })
    requesterUid: string;

    @Column({ name: 'addressee_uid' })
    addresseeUid: string;

    @Column({ name: 'requester_name' })
    requesterName: string;

    @Column({ name: 'addressee_name' })
    addresseeName: string;

    @Column({ name: 'status', default: FriendshipStatuses.PENDING })
    status: FriendshipStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
