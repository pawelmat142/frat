/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './services/NotificationService';
import { NotificationSocketHandler } from './services/NotificationSocketHandler';
import { NotificationEntity } from './model/NotificationEntity';
import { NotificationsController } from './NotificationController';
import { AuthModule } from 'auth/AuthModule';
import { UserModule } from 'user/UserModule';
import { FriendshipNotificationService } from './services/FriendshipNotificationService';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    AuthModule,
    UserModule,
  ],
  controllers: [
    NotificationsController
  ],
  providers: [
    NotificationService,
    FriendshipNotificationService,
    NotificationSocketHandler,
  ],
  exports: [
    NotificationService,
    NotificationSocketHandler,
  ],
})
export class NotificationModule {}
