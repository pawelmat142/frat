import { TrainingI, TrainingStatus, TrainingStatuses } from '@shared/interfaces/TrainingI';
import { Point } from '@shared/interfaces/WorkerI';
import { Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('jh_trainings')
export class TrainingEntity implements TrainingI {

    @PrimaryGeneratedColumn({ name: 'training_id' })
    @Expose()
    trainingId: number;

    @Column({ name: 'provider_id' })
    @Expose()
    providerId: number;

    @Column({ name: 'uid' })
    @Expose()
    uid: string;

    @Column({ name: 'title' })
    @Expose()
    title: string;

    @Column({ name: 'description', nullable: true })
    @Expose()
    description?: string;

    @Column({ name: 'certificate_code' })
    @Expose()
    certificateCode: string;

    @Column({ name: 'languages', type: 'text', array: true, nullable: true })
    @Expose()
    languages?: string[];

    @Column({ name: 'location_country' })
    @Expose()
    locationCountry: string;

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

    @Column({ name: 'price', type: 'numeric', precision: 10, scale: 2, nullable: true })
    @Expose()
    price?: number;

    @Column({ name: 'currency', nullable: true })
    @Expose()
    currency?: string;

    @Column({ name: 'is_recurring', default: false })
    @Expose()
    isRecurring: boolean;

    @Column({ name: 'recurring_interval_days', type: 'int', nullable: true })
    @Expose()
    recurringIntervalDays?: number;

    @Column({ name: 'max_participants', type: 'int', nullable: true })
    @Expose()
    maxParticipants?: number;

    @Column({ name: 'contact_email', nullable: true })
    @Expose()
    contactEmail?: string;

    @Column({ name: 'contact_website', nullable: true })
    @Expose()
    contactWebsite?: string;

    @Column({ name: 'status', default: TrainingStatuses.DRAFT })
    @Expose()
    status: TrainingStatus;

    @Column({ name: 'unique_views_count', default: 0 })
    @Expose()
    uniqueViewsCount: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
