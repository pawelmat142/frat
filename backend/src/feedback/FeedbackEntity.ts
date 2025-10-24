/** Created by Pawel Malek **/
import { FeedbackI, FeedbackStatus } from '@shared/interfaces/FeedbackI';
import { Expose } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('jh_feedback')
export class FeedbackEntity implements FeedbackI {

  @PrimaryGeneratedColumn({ name: 'feedback_id' })
  feedbackId: number;

  @Column({ name: 'status' })
  @Expose()
  status: FeedbackStatus

  @Column({ name: 'uid', nullable: true })
  @Expose()
  uid?: string;

  @Column({ name: 'message' })
  @Expose()
  message: string
  
  @Column({ name: 'contactEmail', nullable: true })
  @Expose()
  contactEmail?: string;
  
  // AUDIT FIELDS
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @Expose()
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'version', type: 'int', default: 1, onUpdate: 'version + 1' })
  version: number;
}
