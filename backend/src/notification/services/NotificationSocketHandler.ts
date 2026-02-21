/** Created by Pawel Malek **/
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SocketHandler } from 'global/web-socket/SocketHandler';
import { SocketGateway } from 'global/web-socket/SocketGateway';
import { AuthenticatedSocket } from 'global/web-socket/AuthenticatedSocket';
import { NotificationService } from './NotificationService';
import { NotificationEvents } from '@shared/interfaces/NotificationI';
import { FriendshipI } from '@shared/interfaces/FriendshipI';
import { SocketUtil } from '@shared/utils/SocketUtil';
import { UserI } from '@shared/interfaces/UserI';

@Injectable()
export class NotificationSocketHandler implements SocketHandler, OnModuleInit {

  private readonly logger = new Logger(NotificationSocketHandler.name);

  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly notificationService: NotificationService,
  ) {}

  onModuleInit(): void {
    this.socketGateway.registerHandler(this);
  }

  async onConnect(socket: AuthenticatedSocket): Promise<void> {
    const uid = socket.user.uid;
    if (!uid) {
      throw new Error('Authenticated socket missing user UID');
    }
    // Join user to their personal notification room
    socket.join(SocketUtil.userRoom(uid));
  }

  async onFullDisconnect(uid: string): Promise<void> {
    this.logger.log(`NotificationSocketHandler onFullDisconnect ${uid}`);
    // No cleanup needed for notifications
  }

  /**
   * Notifies the user about a new friend invitation
   */
  async notifyFriendshipInvite(requester: UserI, recipientUid: string, friendship: FriendshipI): Promise<void> {
    const notification = await this.notificationService.createFriendInviteNotification(requester, recipientUid, friendship);
    this.socketGateway.emitToUser(recipientUid, NotificationEvents.NOTIFICATION_RECEIVED, notification);
  }

  /**
   * Notifies the user that a friend invitation was accepted
   */
  async notifyFriendshipAccepted(friendship: FriendshipI): Promise<void> {
    const notification = await this.notificationService.createFriendshipAcceptedNotification(friendship);
    this.socketGateway.emitToUser(friendship.requesterUid, NotificationEvents.NOTIFICATION_RECEIVED, notification);
  }

  /**
   * Notifies the user that a friend was removed
   */
  async notifyFriendshipRemoved(user: UserI, friendship: FriendshipI, removedFriendshipId: number): Promise<void> {
    const otherUserUid = friendship.requesterUid === user.uid ? friendship.addresseeUid : friendship.requesterUid;
    const notification = await this.notificationService.createFriendshipRemovedNotification(user, otherUserUid, removedFriendshipId);
    this.socketGateway.emitToUser(otherUserUid, NotificationEvents.NOTIFICATION_RECEIVED, notification);
  }

  /**
   * Notifies the user that a friend invitation was rejected
   */
  async deleteFriendshipInvitationNotification(friendship: FriendshipI): Promise<void> {
    const notification = await this.notificationService.deleteFriendInviteNotification(friendship);
    if (notification) {
      this.socketGateway.emitToUser(friendship.addresseeUid, NotificationEvents.NOTIFICATION_DELETED, notification.notificationId );
    }
  }

}