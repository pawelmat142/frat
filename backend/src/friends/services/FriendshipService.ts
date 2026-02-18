/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { FriendshipRepo } from './FriendshipRepo';
import { FriendshipEntity } from 'friends/model/FriendshipEntity';
import { FriendshipStatuses } from '@shared/interfaces/FriendshipI';
import { UserI } from '@shared/interfaces/UserI';
import { ToastException } from 'global/exceptions/ToastException';
import { UserService } from 'user/services/UserService';
import { FriendshipSocketHandler } from './FriendshipSocketHandler';
import { NotificationSocketHandler } from 'notification/services/NotificationSocketHandler';

@Injectable()
export class FriendshipService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly friendshipRepo: FriendshipRepo,
        private readonly userService: UserService,
        private readonly friendshipSocketHandler: FriendshipSocketHandler,
        private readonly notificationSocketHandler: NotificationSocketHandler,
    ) { }

    async sendInvite(requester: UserI, addresseeUid: string): Promise<FriendshipEntity> {
        if (requester.uid === addresseeUid) {
            throw new ToastException('friendship.error.cannotInviteSelf', this);
        }

        const existing = await this.friendshipRepo.findByUids(requester.uid, addresseeUid);
        const addressee: UserI = await this.userService.getUserByUid(addresseeUid);

        if (existing) {
            if (existing.status === FriendshipStatuses.ACCEPTED) {
                throw new ToastException('friendship.error.alreadyFriends', this);
            }
            if (existing.status === FriendshipStatuses.PENDING) {
                throw new ToastException('friendship.error.invitationAlreadySent', this);
            }
            if (existing.status === FriendshipStatuses.REJECTED) {
                existing.requesterName = requester.displayName;
                existing.addresseeName = addressee.displayName;
                existing.requesterUid = requester.uid;
                existing.addresseeUid = addressee.uid;
                const updated = await this.friendshipRepo.updateStatus(existing, FriendshipStatuses.PENDING);
                this.logger.log(`Re-sent friendship invite: ${requester.uid} -> ${addressee.uid}`);
                this.friendshipSocketHandler.notifyInviteReceived(updated);
                this.notificationSocketHandler.notifyFriendshipInvite(addresseeUid, updated);
                return updated;
            }
        }

        const friendship = await this.friendshipRepo.create(requester, addressee);

        this.logger.log(`Sent friendship invite: ${requester.uid} -> ${addressee.uid}`);
        this.friendshipSocketHandler.notifyInviteReceived(friendship);
        this.notificationSocketHandler.notifyFriendshipInvite(addresseeUid, friendship);    
        return friendship;
    }

    async acceptInvite(user: UserI, friendshipId: number): Promise<FriendshipEntity> {
        const friendship = await this.getAndValidatePendingInvite(user, friendshipId);
        // Only the addressee can accept
        if (friendship.addresseeUid !== user.uid) {
            throw new ToastException('friendship.error.notAuthorized', this);
        }
        const updated = await this.friendshipRepo.updateStatus(friendship, FriendshipStatuses.ACCEPTED)

        this.logger.log(`Accepted friendship: ${friendship.requesterUid} <-> ${friendship.addresseeUid}`)
        this.friendshipSocketHandler.notifyInviteAccepted(updated)
        this.notificationSocketHandler.notifyFriendshipAccepted(updated)
        return updated;
    }

    async rejectInvite(user: UserI, friendshipId: number): Promise<FriendshipEntity> {
        const friendship = await this.getAndValidatePendingInvite(user, friendshipId)
        // Only the addressee and requester can reject
        if (friendship.addresseeUid !== user.uid && friendship.requesterUid !== user.uid) {
            throw new ToastException('friendship.error.notAuthorized', this);
        }
        const updated = await this.friendshipRepo.updateStatus(friendship, FriendshipStatuses.REJECTED)
        this.logger.log(`Rejected friendship: ${friendship.requesterUid} -> ${friendship.addresseeUid}`)

        this.friendshipSocketHandler.notifyInviteRejected(updated)
        this.notificationSocketHandler.deleteFriendshipInvitationNotification(updated)
        return updated
    }

    async removeFriend(user: UserI, friendshipId: number): Promise<void> {
        const friendship = await this.friendshipRepo.findById(friendshipId)
        if (!friendship) {
            throw new ToastException('friendship.error.notFound', this);
        }

        const isParticipant = friendship.requesterUid === user.uid || friendship.addresseeUid === user.uid;
        if (!isParticipant) {
            throw new ToastException('friendship.error.notAuthorized', this);
        }

        const result = await this.friendshipRepo.delete(friendship);

        this.logger.log(`Removed friendship: ${friendship.requesterUid} <-> ${friendship.addresseeUid}`);
        this.friendshipSocketHandler.notifyFriendRemoved(friendship)
        this.notificationSocketHandler.notifyFriendshipRemoved(user, friendship);
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
