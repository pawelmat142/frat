/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TranslationService } from './TranslationService';
import { DictionariesModule } from 'admin/dictionaries/DictionariesModule';
import { TranslationController } from './TranslationController';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TranslationEntity } from '../dictionaries/model/TranslationEntity';
import { TranslationsImportServiceController } from './TranslationsImportServiceController';
import { TranslationPublicService } from './TranslationPublicService';
import { AuthModule } from 'auth/AuthModule';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TranslationEntity,
    ]),

    DictionariesModule,
    AuthModule
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
