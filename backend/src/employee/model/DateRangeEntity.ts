import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { WorkerEntity } from "./WorkerEntity";
import { DateRangeI } from "@shared/interfaces/WorkerProfileI";

/**
 * Encja dla pojedynczego zakresu dostępności pracownika
 */
@Entity('jh_workers_date_ranges')
export class DateRangeEntity implements DateRangeI {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ManyToOne(() => WorkerEntity, profile => profile.availabilityDateRanges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'worker_id' })
  worker: WorkerEntity;

  @Column({ name: 'date_range', type: 'daterange' })
  dateRange: string;
}