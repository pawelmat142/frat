/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatabaseConfig } from './global/DatabaseConfig';
import { DictionariesModule } from './admin/dictionaries/DictionariesModule';
import { TranslationModule } from 'admin/translation/TranslationModule';
import { AuthModule } from 'auth/AuthModule';
import { GlobalController } from 'global/GlobalController';
import { UsersAdminModule } from 'admin/users/UsersAdminModule';
import { EmployeeProfileModule } from 'employee/EmployeeProfileModule';
import { FeedbackModule } from 'feedback/FeedbackModule';
import { OffersModule } from 'offer/OfferModule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    // Serve static React app from backend/public
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api*'],
    }),

    // ADMIN
    DictionariesModule,
    TranslationModule,
    UsersAdminModule,

    // AUTH
    AuthModule,

    EmployeeProfileModule,
    OffersModule,

    FeedbackModule
  ],
  controllers: [
    GlobalController,
  ]
})
export class AppModule {}
