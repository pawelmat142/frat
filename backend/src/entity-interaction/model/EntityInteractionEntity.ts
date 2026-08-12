/** Created by Pawel Malek **/
import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { EntityInteractionEntityType, EntityInteractionEventType, EntityInteractionI } from '@shared/interfaces/EntityInteractionI';
import { UserEntity } from 'user/model/UserEntity';

@Entity('jh_entity_interactions')
@Index(['entityType', 'entityId'])
@Index(['entityType', 'entityId', 'userUid', 'date'])
export class EntityInteractionEntity implements EntityInteractionI {

  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'entity_type' })
  entityType: EntityInteractionEntityType;

  @Column({ name: 'entity_id' })
  entityId: string;

  @Column({ name: 'event_type' })
  eventType: EntityInteractionEventType;

  @Column({ name: 'user_uid' })
  userUid: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_uid', referencedColumnName: 'uid' })
  user: UserEntity;

  @Column({ name: 'date', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}
