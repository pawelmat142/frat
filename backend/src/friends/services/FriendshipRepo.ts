/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FriendshipEntity } from 'friends/model/FriendshipEntity';
import { FriendshipStatus, FriendshipStatuses } from '@shared/interfaces/FriendshipI';
import { UserI } from '@shared/interfaces/UserI';

@Injectable()
export class FriendshipRepo {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(FriendshipEntity)
        private readonly friendshipRepository: Repository<FriendshipEntity>,
    ) { }

    public create(requester: UserI, addressee: UserI): Promise<FriendshipEntity> {
        const entity = this.friendshipRepository.create({
            requesterUid: requester.uid,
            addresseeUid: addressee.uid,
            requesterName: requester.displayName,
            addresseeName: addressee.displayName,
            status: FriendshipStatuses.PENDING,
        });
        return this.friendshipRepository.save(entity);
    }

    public findByUids(uidA: string, uidB: string): Promise<FriendshipEntity | null> {
        return this.friendshipRepository.findOne({
            where: [
                { requesterUid: uidA, addresseeUid: uidB },
                { requesterUid: uidB, addresseeUid: uidA },
            ],
        });
    }

    public findById(friendshipId: number): Promise<FriendshipEntity | null> {
        return this.friendshipRepository.findOneBy({ friendshipId });
    }

    public updateStatus(entity: FriendshipEntity, status: FriendshipStatus): Promise<FriendshipEntity> {
        entity.status = status;
        return this.friendshipRepository.save(entity);
    }

    public delete(entity: FriendshipEntity): Promise<FriendshipEntity> {
        return this.friendshipRepository.remove(entity);
    }

    /** All accepted friends for a given uid */
    public findFriendsByUid(uid: string): Promise<FriendshipEntity[]> {
        return this.friendshipRepository.find({
            where: [
                { requesterUid: uid },
                { addresseeUid: uid },
            ],
        });
    }

    /** Pending invitations received by a given uid */
    public findPendingForAddressee(uid: string): Promise<FriendshipEntity[]> {
        return this.friendshipRepository.find({
            where: { addresseeUid: uid, status: FriendshipStatuses.PENDING },
            order: { createdAt: 'DESC' },
        });
    }

    /** Pending invitations sent by a given uid */
    public findPendingByRequester(uid: string): Promise<FriendshipEntity[]> {
        return this.friendshipRepository.find({
            where: { requesterUid: uid, status: FriendshipStatuses.PENDING },
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Count mutual friends between two uids using a single efficient query.
     * Used for search sorting by mutual friends count.
     */
    public async countMutualFriends(uidA: string, uidB: string): Promise<number> {
        const result = await this.friendshipRepository.query(`
            SELECT COUNT(*) AS count FROM (
                SELECT CASE WHEN requester_uid = $1 THEN addressee_uid ELSE requester_uid END AS friend_uid
                FROM jh_friendships
                WHERE (requester_uid = $1 OR addressee_uid = $1) AND status = 'ACCEPTED'
                INTERSECT
                SELECT CASE WHEN requester_uid = $2 THEN addressee_uid ELSE requester_uid END AS friend_uid
                FROM jh_friendships
                WHERE (requester_uid = $2 OR addressee_uid = $2) AND status = 'ACCEPTED'
            ) AS mutual
        `, [uidA, uidB]);
        return parseInt(result[0]?.count ?? '0', 10);
    }
}
