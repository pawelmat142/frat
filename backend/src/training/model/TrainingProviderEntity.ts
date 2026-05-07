import { TrainingProviderProfileI, TrainingProviderStatus, TrainingProviderStatuses } from '@shared/interfaces/TrainingI';
import { AvatarRef } from '@shared/interfaces/UserI';
import { ParsedPhoneNumber, Point } from '@shared/interfaces/WorkerI';
import { Expose } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('jh_training_providers')
export class TrainingProviderEntity implements TrainingProviderProfileI {

    @PrimaryGeneratedColumn({ name: 'provider_id' })
    @Expose()
    providerId: number;

    @Column({ name: 'uid', unique: true })
    @Expose()
    uid: string;

    @Column({ name: 'company_name' })
    @Expose()
    companyName: string;

    @Column({ name: 'description', nullable: true })
    @Expose()
    description?: string;

    @Column({ name: 'website', nullable: true })
    @Expose()
    website?: string;

    @Column({ name: 'contact_email', nullable: true })
    @Expose()
    contactEmail?: string;

    @Column({ name: 'phone_number', type: 'jsonb', nullable: true })
    @Expose()
    phoneNumber?: ParsedPhoneNumber;

    @Column({ name: 'logo_ref', type: 'jsonb', nullable: true })
    @Expose()
    logoRef?: AvatarRef;

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

    @Column({ name: 'status', default: TrainingProviderStatuses.ACTIVE })
    @Expose()
    status: TrainingProviderStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
