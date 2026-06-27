/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { NotificationI } from '@shared/interfaces/NotificationI';
import { NotificationEntity } from 'notification/model/NotificationEntity';
import { ToastException } from 'global/exceptions/ToastException';
import { UserI } from '@shared/interfaces/UserI';
import { ExpirationNotificationService } from './ExpirationNotificationService';
import { MeUserContextNotificationsRequest } from 'notification/model/interfaces';

@Injectable()
export class NotificationService {

  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly expirationNotificationService: ExpirationNotificationService,
  ) {}

  async getMeUserContextNotifications(request: MeUserContextNotificationsRequest): Promise<NotificationI[]> {
    let notifications = await this.getUserNotifications(request.recipientUid, request.limit, request.offset);

    const offersExpirations = this.expirationNotificationService.createExpirationNotificationsForOffers(request.offers);

    const allNotifications = [
      ...offersExpirations, 
      ...notifications
    ];

    if (request.worker) {
      const expirationNotification = this.expirationNotificationService.createExpirationNotificationForWorker(request.worker);
      if (expirationNotification) {
        return [
          expirationNotification, 
          ...allNotifications
        ];
      }
    }
    
    return allNotifications;
  }

  /**
   * Retrieves the list of notifications for a user (with pagination)
   */
  private async getUserNotifications(recipientUid: string, limit = 20, offset = 0): Promise<NotificationI[]> {
    return await this.notificationRepository.find({
      where: { recipientUid },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async deleteNotification(user: UserI, notificationId: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: {
        notificationId,
        recipientUid: user.uid,
      },
    });
    if (!notification) {
      throw new ToastException('notification.error.notFound', this);
    }
    await this.notificationRepository.delete(notification.notificationId);
    this.logger.log(`Deleted notification ${notificationId} for user ${user.uid}`);
  }

  /**
   * Retrieves a single notification by its ID, ensuring it belongs to the user
   */
  async getNotification(user: UserI, notificationId: number): Promise<NotificationI | null> {
    const notification = await this.notificationRepository.findOne({
      where: {
        notificationId,
        recipientUid: user.uid,
      },
    });
    if (!notification) {
      return null;
    }
    return notification;
  }

  /**
   * Marks a notification as read by its ID
   */
  async markAsRead(user: UserI, notificationId: number): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: {
        notificationId,
        recipientUid: user.uid,
      },
    });
    if (!notification) {
      throw new ToastException('notification.error.notFound', this);
    }
    notification.readAt = new Date();
    await this.notificationRepository.save(notification);
    this.logger.log(`Marked notification ${notificationId} as read for user ${user.uid}`);
  }


  create(entity: DeepPartial<NotificationEntity>): NotificationEntity {
    return this.notificationRepository.create(entity);
  }

  save(notification: NotificationEntity): Promise<NotificationEntity> {
    return this.notificationRepository.save(notification);
  }

//   TODO
//   async cleanupOldNotifications(daysOld = 30): Promise<void> {
}