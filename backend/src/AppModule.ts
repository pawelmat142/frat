/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './global/DatabaseConfig';
import { DictionariesModule } from './admin/dictionaries/DictionariesModule';
import { TranslationModule } from 'admin/translation/TranslationModule';
import { AuthModule } from 'auth/AuthModule';
import { GlobalController } from 'global/GlobalController';
import { UsersAdminModule } from 'admin/users/UsersAdminModule';
import { WorkerModule } from 'employee/WorkerModule';
import { FeedbackModule } from 'feedback/FeedbackModule';
import { OffersModule } from 'offer/OfferModule';
import { UserManagementModule } from 'user/UserManagement/UserManagementModule';
import { TelegramModule } from 'telegram/telegram.module';
import { ChatModule } from 'chat/ChatModule';
import { FriendsModule } from 'friends/FriendsModule';
import { NotificationModule } from 'notification/NotificationModule';
import { SocketModule } from 'global/web-socket/SocketModule';
import { GeocodingService } from 'global/services/GeocodingService';
import { SettingsModule } from 'user/settings-module/SettingsModule';
import { UserContextModule } from 'user/user-context-module/UserContextModule';
import { UserListedModule } from 'user/user-listed-module/UserListedModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // ADMIN
    DictionariesModule,
    TranslationModule,
    UsersAdminModule,

    // AUTH
    AuthModule,
    TelegramModule,

    UserManagementModule,
    WorkerModule,
    OffersModule,

    FeedbackModule,
    SocketModule,
    ChatModule,
    FriendsModule,
    NotificationModule,
    SettingsModule,
    UserContextModule,
    UserListedModule,
  ],
  controllers: [
    GlobalController,
  ],
  providers: [
    GeocodingService,
  ],
})
export class AppModule {}
