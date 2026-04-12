/** Created by Pawel Malek **/
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityInteractionEntityType, EntityInteractionEventType } from '@shared/interfaces/EntityInteractionI';
import { Repository } from 'typeorm';
import { EntityInteractionEntity } from '../model/EntityInteractionEntity';

@Injectable()
export class EntityInteractionRepo {

  constructor(
    @InjectRepository(EntityInteractionEntity)
    private readonly repository: Repository<EntityInteractionEntity>,
  ) {}

  public findRecentInteraction(
    entityType: EntityInteractionEntityType,
    entityId: number,
    userUid: string,
    eventType: EntityInteractionEventType,
    windowDays: number,
  ): Promise<EntityInteractionEntity | null> {
    const since = new Date();
    since.setDate(since.getDate() - windowDays);

    return this.repository.createQueryBuilder('i')
      .where('i.entity_type = :entityType', { entityType })
      .andWhere('i.entity_id = :entityId', { entityId })
      .andWhere('i.user_uid = :userUid', { userUid })
      .andWhere('i.event_type = :eventType', { eventType })
      .andWhere('i.date > :since', { since })
      .getOne();
  }

  public findRecentInteractions(uid: string, entityType: EntityInteractionEntityType, eventType: EntityInteractionEventType, limit: number): Promise<EntityInteractionEntity[]> {
    return this.repository.createQueryBuilder('i')
      .where('i.entity_type = :entityType', { entityType })
      .andWhere('i.event_type = :eventType', { eventType })
      .andWhere('i.user_uid = :uid', { uid })
      .orderBy('i.date', 'DESC')
      .limit(limit)
      .getMany();
  }

  public save(interaction: Partial<EntityInteractionEntity>): Promise<EntityInteractionEntity> {
    return this.repository.save(this.repository.create(interaction));
  }
}
