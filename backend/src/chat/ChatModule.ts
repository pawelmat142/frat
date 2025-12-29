/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatEntity } from './model/ChatEntity';
import { ChatMemberEntity } from './model/ChatMemberEntity';
import { ChatMessageEntity } from './model/ChatMessageEntity';
import { ChatGateway } from './ChatGateway';
import { ChatService } from './services/ChatService';
import { ChatRepo } from './services/ChatRepo';
import { AuthModule } from 'auth/AuthModule';
import { UserModule } from 'user/UserModule';
import { ChatController } from './ChatController';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChatEntity,
      ChatMemberEntity,
      ChatMessageEntity,
    ]),
    AuthModule,
    UserModule,
  ],
  controllers: [
    ChatController,
  ],
  providers: [
    ChatGateway,
    ChatService,
    ChatRepo,
  ],
  exports: [
    ChatService,
  ],
})
export class ChatModule {}
