import { TrainingSessionI, TrainingSessionStatus, TrainingSessionStatuses } from '@shared/interfaces/TrainingI';
import { Point } from '@shared/interfaces/WorkerI';
import { Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('jh_training_sessions')
export class TrainingSessionEntity implements TrainingSessionI {

    @PrimaryGeneratedColumn({ name: 'session_id' })
    @Expose()
    sessionId: number;

    @Column({ name: 'training_id' })
    @Expose()
    trainingId: number;

    /** Local date string in YYYY-MM-DD format */
    @Column({ name: 'start_date', type: 'date' })
    @Expose()
    startDate: string;

    /** Local date string in YYYY-MM-DD format */
    @Column({ name: 'end_date', type: 'date', nullable: true })
    @Expose()
    endDate?: string;

    @Column({ name: 'location_country', nullable: true })
    @Expose()
    locationCountry?: string;

    @Column({ name: 'display_address', nullable: true })
    @Expose()
    displayAddress?: string;

    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    })
    point?: Point;

    @Column({ name: 'max_participants', type: 'int', nullable: true })
    @Expose()
    maxParticipants?: number;

    // Placeholder column – will be updated by booking feature when implemented
    @Column({ name: 'bookings_count', default: 0 })
    @Expose()
    bookingsCount: number;

    @Column({ name: 'status', default: TrainingSessionStatuses.SCHEDULED })
    @Expose()
    status: TrainingSessionStatus;

    @Column({ name: 'notes', nullable: true })
    @Expose()
    notes?: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
