/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './services/NotificationService';
import { NotificationSocketHandler } from './services/NotificationSocketHandler';
import { NotificationEntity } from './model/NotificationEntity';
import { NotificationsController } from './NotificationController';
import { AuthModule } from 'auth/AuthModule';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
    AuthModule,
  ],
  controllers: [
    NotificationsController
  ],
  providers: [
    NotificationService,
    NotificationSocketHandler,
  ],
  exports: [
    NotificationService,
    NotificationSocketHandler,
  ],
})
export class NotificationModule {}
