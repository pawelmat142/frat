/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DictionariesController } from './DictionariesController';
import { DictionariesService } from './services/DictionariesService';
import { DictionariesRepo } from './services/DictionariesRepo';
import { DictionaryEntity } from './model/DictionaryEntity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DictionaryEntity,
    ]),
  ],
  controllers: [DictionariesController],
  providers: [DictionariesService, DictionariesRepo],
  exports: [],
})
export class DictionariesModule {}
