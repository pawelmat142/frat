/** Created by Pawel Malek **/
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { EntityInteractionEntityType, EntityInteractionEventType, EntityInteractionI } from '@shared/interfaces/EntityInteractionI';

@Entity('jh_entity_interactions')
@Index(['entityType', 'entityId'])
@Index(['entityType', 'entityId', 'userUid', 'date'])
export class EntityInteractionEntity implements EntityInteractionI {

  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'entity_type' })
  entityType: EntityInteractionEntityType;

  @Column({ name: 'entity_id' })
  entityId: number;

  @Column({ name: 'event_type' })
  eventType: EntityInteractionEventType;

  @Column({ name: 'user_uid' })
  userUid: string;

  @Column({ name: 'date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}
