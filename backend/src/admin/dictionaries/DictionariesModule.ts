/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionariesController } from './DictionariesController';
import { DictionariesService } from './services/DictionariesService';
import { DictionariesRepo } from './services/DictionariesRepo';
import { DictionaryEntity } from './model/DictionaryEntity';
import { DictionariesImportServiceController } from './DictionariesImportServiceController';
import { AuthModule } from 'auth/AuthModule';
import { DictionariesPublicService } from './services/DictionariesPublicService';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DictionaryEntity,
    ]),

    AuthModule
  ],
  controllers: [
    DictionariesController, 
    DictionariesImportServiceController,
  ],
  providers: [
    DictionariesService, 
    DictionariesRepo,
    DictionariesPublicService
  ],
  exports: [
    DictionariesService,
    DictionariesPublicService
  ],
})
export class DictionariesModule {}
