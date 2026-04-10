/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EntityInteractionEntity } from './model/EntityInteractionEntity';
import { EntityInteractionRepo } from './services/EntityInteractionRepo';
import { EntityInteractionService } from './services/EntityInteractionService';

@Module({
  imports: [TypeOrmModule.forFeature([EntityInteractionEntity])],
  providers: [EntityInteractionRepo, EntityInteractionService],
  exports: [EntityInteractionService],
})
export class EntityInteractionModule {}
