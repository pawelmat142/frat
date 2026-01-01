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
import { EmployeeProfileModule } from 'employee/EmployeeProfileModule';
import { FeedbackModule } from 'feedback/FeedbackModule';
import { OffersModule } from 'offer/OfferModule';
import { UserManagementModule } from 'user/UserManagement/UserManagementModule';
import { TelegramModule } from 'telegram/telegram.module';
import { ChatModule } from 'chat/ChatModule';
import { GeocodingService } from 'global/services/GeocodingService';

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
    EmployeeProfileModule,
    OffersModule,

    FeedbackModule,
    ChatModule,
  ],
  controllers: [
    GlobalController,
  ],
  providers: [
    GeocodingService,
  ],
})
export class AppModule {}
