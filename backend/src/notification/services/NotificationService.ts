/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationI, NotificationTypes, NotificationIcons } from '@shared/interfaces/NotificationI';
import { FriendshipI } from '@shared/interfaces/FriendshipI';
import { NotificationEntity } from 'notification/model/NotificationEntity';
import { ToastException } from 'global/exceptions/ToastException';
import { UserI } from '@shared/interfaces/UserI';

@Injectable()
export class NotificationService {

  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  /**
     * Creates a notification for a new friend invitation
   */
  async createFriendInviteNotification(recipientUid: string, friendship: FriendshipI): Promise<NotificationI> {
    // TODO translacje
    const notification = this.notificationRepository.create({
      recipientUid,
      type: NotificationTypes.FRIEND_INVITE,
      targetId: friendship.friendshipId.toString(),
      title: 'Nowe zaproszenie',
      message: `${friendship.requesterName} wysłał Ci zaproszenie do znajomych`,
      icon: NotificationIcons.FRIEND,
      metadata: {
        requesterUid: friendship.requesterUid,
        requesterName: friendship.requesterName,
      }
    });

    const saved = await this.notificationRepository.save(notification);
    this.logger.log(`Created friend invite notification ${saved.notificationId} for user ${recipientUid}`);
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

  /**
     * Retrieves the list of notifications for a user (with pagination)
   */
  async getUserNotifications(recipientUid: string, limit = 20, offset = 0): Promise<NotificationI[]> {
    return await this.notificationRepository.find({
      where: { recipientUid },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Marks a notification as read by its ID
   */
  async markAsRead(user: UserI, notificationId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: {
        notificationId,
        recipientUid: user.uid,
      },
    });
    if (!notification) {
      // TODO translation
      throw new ToastException('Nie można znaleźć powiadomienia o podanym ID', this);
    }
    notification.readAt = new Date();
    await this.notificationRepository.save(notification);
    this.logger.log(`Marked notification ${notificationId} as read for user ${user.uid}`);
  }

//   TODO
//   async cleanupOldNotifications(daysOld = 30): Promise<void> {
}