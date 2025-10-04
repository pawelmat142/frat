/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TranslationService } from './TranslationService';
import { DictionariesModule } from 'admin/dictionaries/DictionariesModule';
import { TranslationController } from './TranslationController';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationEntity } from './TranslationEntity';
import { TranslationsImportServiceController } from './TranslationsImportServiceController';
import { TranslationPublicService } from './TranslationPublicService';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TranslationEntity,
    ]),

    DictionariesModule
  ],
  controllers: [
    TranslationController,
    TranslationsImportServiceController
  ],
  providers: [
    TranslationService, 
    TranslationPublicService
  ],
  exports: [
    TranslationPublicService
  ],
})
export class TranslationModule { }
