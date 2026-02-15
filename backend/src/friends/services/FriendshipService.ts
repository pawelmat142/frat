/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { FriendshipRepo } from './FriendshipRepo';
import { FriendshipEntity } from 'friends/model/FriendshipEntity';
import { FriendshipStatuses } from '@shared/interfaces/FriendshipI';
import { UserI } from '@shared/interfaces/UserI';
import { ToastException } from 'global/exceptions/ToastException';

@Injectable()
export class FriendshipService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly friendshipRepo: FriendshipRepo,
    ) { }

    async sendInvite(user: UserI, addresseeUid: string): Promise<FriendshipEntity> {
        if (user.uid === addresseeUid) {
            throw new ToastException('friendship.error.cannotInviteSelf', this);
        }

        const existing = await this.friendshipRepo.findByUids(user.uid, addresseeUid);

        if (existing) {
            if (existing.status === FriendshipStatuses.ACCEPTED) {
                throw new ToastException('friendship.error.alreadyFriends', this);
            }
            if (existing.status === FriendshipStatuses.PENDING) {
                throw new ToastException('friendship.error.invitationAlreadySent', this);
            }
            // REJECTED — allow re-sending by updating status back to PENDING
            if (existing.status === FriendshipStatuses.REJECTED) {
                existing.requesterUid = user.uid;
                existing.addresseeUid = addresseeUid;
                const updated = await this.friendshipRepo.updateStatus(existing, FriendshipStatuses.PENDING);
                this.logger.log(`Re-sent friendship invite: ${user.uid} -> ${addresseeUid}`);
                return updated;
            }
        }

        const friendship = await this.friendshipRepo.create(user.uid, addresseeUid);
        this.logger.log(`Sent friendship invite: ${user.uid} -> ${addresseeUid}`);
        return friendship;
    }

    async acceptInvite(user: UserI, friendshipId: number): Promise<FriendshipEntity> {
        const friendship = await this.getAndValidatePendingInvite(user, friendshipId);
        // Only the addressee can accept
        if (friendship.addresseeUid !== user.uid) {
            throw new ToastException('friendship.error.notAuthorized', this);
        }
        const updated = await this.friendshipRepo.updateStatus(friendship, FriendshipStatuses.ACCEPTED);
        this.logger.log(`Accepted friendship: ${friendship.requesterUid} <-> ${friendship.addresseeUid}`);
        return updated;
    }

    async rejectInvite(user: UserI, friendshipId: number): Promise<FriendshipEntity> {
        const friendship = await this.getAndValidatePendingInvite(user, friendshipId);
        // Only the addressee and requester can reject
        if (friendship.addresseeUid !== user.uid && friendship.requesterUid !== user.uid) {
            throw new ToastException('friendship.error.notAuthorized', this);
        }
        const updated = await this.friendshipRepo.updateStatus(friendship, FriendshipStatuses.REJECTED);
        this.logger.log(`Rejected friendship: ${friendship.requesterUid} -> ${friendship.addresseeUid}`);
        return updated;
    }

    async removeFriend(user: UserI, friendshipId: number): Promise<void> {
        const friendship = await this.friendshipRepo.findById(friendshipId);
        if (!friendship) {
            throw new ToastException('friendship.error.notFound', this);
        }

        const isParticipant = friendship.requesterUid === user.uid || friendship.addresseeUid === user.uid;
        if (!isParticipant) {
            throw new ToastException('friendship.error.notAuthorized', this);
        }

        await this.friendshipRepo.delete(friendship);
        this.logger.log(`Removed friendship: ${friendship.requesterUid} <-> ${friendship.addresseeUid}`);
    }

    async getFriendships(uid: string): Promise<FriendshipEntity[]> {
        return this.friendshipRepo.findFriendsByUid(uid);
    }

    async getPendingReceived(uid: string): Promise<FriendshipEntity[]> {
        return this.friendshipRepo.findPendingForAddressee(uid);
    }

    async getPendingSent(uid: string): Promise<FriendshipEntity[]> {
        return this.friendshipRepo.findPendingByRequester(uid);
    }

    private async getAndValidatePendingInvite(user: UserI, friendshipId: number): Promise<FriendshipEntity> {
        const friendship = await this.friendshipRepo.findById(friendshipId);
        if (!friendship) {
            throw new ToastException('friendship.error.notFound', this);
        }
        if (friendship.status !== FriendshipStatuses.PENDING) {
            throw new ToastException('friendship.error.notPending', this);
        }
        return friendship;
    }
}
