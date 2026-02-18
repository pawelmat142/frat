/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationI, NotificationTypes, NotificationIcons } from '@shared/interfaces/NotificationI';
import { FriendshipI } from '@shared/interfaces/FriendshipI';
import { NotificationEntity } from 'notification/model/NotificationEntity';

@Injectable()
export class NotificationService {

  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  /**
   * Tworzy powiadomienie o nowym zaproszeniu do znajomych
   */
  async createFriendInviteNotification(recipientUid: string, friendship: FriendshipI): Promise<NotificationI> {
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
   * Pobiera listę powiadomień dla użytkownika (z paginacją)
   */
  async getUserNotifications(recipientUid: string, limit = 20, offset = 0): Promise<NotificationI[]> {
    return await this.notificationRepository.find({
      where: { recipientUid },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

//   TODO
//   async cleanupOldNotifications(daysOld = 30): Promise<void> {
}