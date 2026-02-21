import { Injectable, Logger } from "@nestjs/common";
import { UserService } from "user/services/UserService";
import { InjectRepository } from "@nestjs/typeorm";
import { FriendshipI } from "@shared/interfaces/FriendshipI";
import { NotificationI, NotificationTypes, NotificationIcons } from "@shared/interfaces/NotificationI";
import { UserI } from "@shared/interfaces/UserI";
import { NotificationEntity } from "notification/model/NotificationEntity";
import { Repository } from "typeorm";

@Injectable()
export class FriendshipNotificationService {
    
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,    
    private readonly userService: UserService,
  ) {}

  /**
     * Creates a notification for a new friend invitation
   */
  async createFriendInviteNotification(requester: UserI, recipientUid: string, friendship: FriendshipI): Promise<NotificationI> {
    const notification = this.notificationRepository.create({
      recipientUid,
      type: NotificationTypes.FRIEND_INVITE,
      targetId: friendship.friendshipId.toString(),
      title: 'notification.newInvitationTitle',
      message: `notification.newInvitationMessage`,
      messageParams: { name: friendship.requesterName },
      icon: NotificationIcons.FRIEND,
      avatarRef: requester.avatarRef,
      requesterUid: requester.uid,
      requesterName: requester.displayName,
    });

    const saved = await this.notificationRepository.save(notification);
    this.logger.log(`Created friend invite notification ${saved.notificationId} for user ${recipientUid}`);
    return saved;
  }

  /**
   * Creates a notification for an accepted friend invitation
   */
  async createFriendshipAcceptedNotification(friendship: FriendshipI): Promise<NotificationI> {
    const addressee = await this.userService.getUserByUid(friendship.addresseeUid);
    const notification = this.notificationRepository.create({
      recipientUid: friendship.requesterUid,
      type: NotificationTypes.FRIEND_ACCEPTED,
      targetId: friendship.friendshipId.toString(),
      title: 'notification.acceptInvitationTitle',
      message: 'notification.acceptInvitationMessage',
      messageParams: { name: friendship.addresseeName },
      icon: NotificationIcons.FRIEND,
      avatarRef: addressee.avatarRef,
      requesterUid: friendship.addresseeUid,
      requesterName: friendship.addresseeName,
    });
    const saved = await this.notificationRepository.save(notification);
    this.logger.log(`Created friendship accepted notification ${saved.notificationId} for user ${friendship.requesterUid}`);
    return saved;
  }

  /**
   * Creates a notification for a removed friend
   */
  async createFriendshipRemovedNotification(user: UserI, otherUserUid: string, removedFriendshipId: number): Promise<NotificationI> {
    const notification = this.notificationRepository.create({
      recipientUid: otherUserUid,
      type: NotificationTypes.FRIEND_REMOVED,
      targetId: removedFriendshipId.toString(),
      title: 'notification.friendRemovedTitle',
      message: 'notification.friendRemovedMessage',
      messageParams: { name: user.displayName },
      icon: NotificationIcons.FRIEND,
      avatarRef: user.avatarRef,
      requesterUid: user.uid,
      requesterName: user.displayName,
    });
    const saved = await this.notificationRepository.save(notification);
    this.logger.log(`Created friendship removed notification ${saved.notificationId} for user ${otherUserUid}`);
    return saved;
  }

  /**
   * Deletes a notification by its ID
   */
  async deleteFriendInviteNotification(friendship: FriendshipI): Promise<NotificationI> {
    const notification = await this.notificationRepository.findOne({
      where: {
        type: NotificationTypes.FRIEND_INVITE,
        recipientUid: friendship.addresseeUid,
      }
    });
    if (!notification) {
      this.logger.error(`No notification found for friendship invite ${friendship.friendshipId} and user ${friendship.addresseeUid}`);
      return null;
    }
    await this.notificationRepository.delete(notification.notificationId);
    this.logger.log(`Deleted friend invite notification ${notification.notificationId} for user ${friendship.addresseeUid}`);
    return notification;
  }
}