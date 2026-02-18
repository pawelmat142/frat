/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationService } from './services/NotificationService';
import { NotificationSocketHandler } from './services/NotificationSocketHandler';
import { NotificationEntity } from './model/NotificationEntity';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity]),
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
