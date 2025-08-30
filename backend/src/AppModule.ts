/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/DatabaseConfig';
import { DictionariesModule } from './admin/dictionaries/DictionariesModule';

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
  ],
})
export class AppModule {}
