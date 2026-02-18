/** Created by Pawel Malek **/
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SocketHandler } from 'global/web-socket/SocketHandler';
import { SocketGateway } from 'global/web-socket/SocketGateway';
import { AuthenticatedSocket } from 'global/web-socket/AuthenticatedSocket';
import { NotificationService } from './NotificationService';
import { NotificationEvents } from '@shared/interfaces/NotificationI';
import { FriendshipI } from '@shared/interfaces/FriendshipI';
import { SocketUtil } from '@shared/utils/SocketUtil';

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
  async notifyFriendshipInvite(recipientUid: string, friendship: FriendshipI): Promise<void> {
    const notification = await this.notificationService.createFriendInviteNotification(recipientUid, friendship);
    this.socketGateway.emitToUser(recipientUid, NotificationEvents.NOTIFICATION_RECEIVED, notification);
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