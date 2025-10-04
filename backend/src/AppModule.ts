/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/DatabaseConfig';
import { DictionariesModule } from './admin/dictionaries/DictionariesModule';
import { TranslationModule } from 'admin/translation/TranslationModule';
import { AuthModule } from 'auth/AuthModule';
import { GlobalController } from 'global/GlobalController';

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

    // AUTH
    AuthModule,
  ],
  controllers: [
    GlobalController
  ]
})
export class AppModule {}
