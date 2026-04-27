/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './model/ChatEntity';
import { ChatMemberEntity } from './model/ChatMemberEntity';
import { ChatMessageEntity } from './model/ChatMessageEntity';
import { ChatService } from './services/ChatService';
import { ChatSocketHandler } from './services/ChatSocketHandler';
import { ChatRepo } from './services/ChatRepo';
import { AuthModule } from 'auth/AuthModule';
import { UserModule } from 'user/UserModule';
import { ChatController } from './ChatController';
import { UserManagementModule } from 'user/UserManagement/UserManagementModule';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatEntity,
      ChatMemberEntity,
      ChatMessageEntity,
    ]),
    AuthModule,
    UserModule,
    UserManagementModule,
  ],
  controllers: [
    ChatController,
  ],
  providers: [
    ChatSocketHandler,
    ChatService,
    ChatRepo,
  ],
  exports: [
    ChatService,
    ChatSocketHandler,
  ],
})
export class ChatModule {}
