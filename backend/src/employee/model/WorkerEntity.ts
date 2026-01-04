/** Created by Pawel Malek **/
import { DateRangeI, WorkerAvailabilityOption, WorkerFormRangesOption, WorkerI, WorkerLocationOption, WorkerStatus, ParsedPhoneNumber, Point } from '@shared/interfaces/WorkerProfileI';
import { AvatarRef } from '@shared/interfaces/UserI';
import { Expose } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { DateRangeEntity } from './DateRangeEntity';
import { GeocodedPosition } from '@shared/interfaces/MapsInterfaces';


@Entity('jh_workers')
export class WorkerEntity implements WorkerI {

  @PrimaryGeneratedColumn({ name: 'worker_id' })
  @Expose()
  workerId: number;

  @Column({ name: 'uid' })
  @Expose()
  uid: string;
  
  @Column({ name: 'status' })
  @Expose()
  status: WorkerStatus;
  
  @Column({ name: 'display_name' })
  @Expose()
  displayName: string;

  // GENERAL INFO
  @Column({ name: 'full_name' })
  @Expose()
  fullName: string;
  
  @Column({ name: 'phone_number', type: 'jsonb' })
  @Expose()
  phoneNumber: ParsedPhoneNumber;

  @Column({ name: 'email', unique: true })
  @Expose()
  email: string;

  @Column({ name: 'communication_languages', type: 'text', array: true })
  @Expose() 
  communicationLanguages: string[];
  
  @Column({ name: 'avatar_ref', type: 'jsonb', nullable: true })
  @Expose()
  avatarRef: AvatarRef;
  
  @Column({ name: 'bio', type: 'text', nullable: true })
  @Expose()
  bio?: string;



  @Column({ name: 'location_option' })
  locationOption: WorkerLocationOption;

  @Column({ name: 'location_countries', type: 'text', array: true, nullable: true })
  locationCountries?: string[];

  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  point?: Point

  @Column({ name: 'full_address', type: 'text', nullable: true })
  fullAddress?: string;

  @Column({ name: 'geocoded_position', type: 'jsonb', nullable: true })
  geocodedPosition?: GeocodedPosition;



  @Column({ name: 'availability_option' })
  availabilityOption: WorkerAvailabilityOption;

  @OneToMany(
    () => DateRangeEntity,
    (range) => range.worker,
    { cascade: true, eager: true }
  )
  availabilityDateRanges?: DateRangeI[];

  @Column({ name: 'ranges_option', nullable: true })
  rangesOption?: WorkerFormRangesOption;

  /** Local date string in YYYY-MM-DD format */
  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;
  
  @Column({ name: 'experience', type: 'text', array: true })
  experience: string[];
  
  @Column({ name: 'certificates', type: 'text', array: true })
  certificates: string[];
  
  

  // STATS
  @Expose()
  @Column({ name: 'views', type: 'text', array: true, default: [] })
  views: string[];
  
  @Expose()
  @Column({ name: 'jobs', type: 'text', array: true, default: [] })
  jobs: string[];
  
  @Expose()
  @Column({ name: 'likes', type: 'text', array: true, default: [] })
  likes: string[];




  // AUDIT FIELDS
  @Expose()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'version', type: 'int', default: 1, onUpdate: 'version + 1' })
  version: number;
}
