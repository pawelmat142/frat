/** Created by Pawel Malek **/
import { DateRangeI, EmployeeProfileAvailabilityOption, EmployeeProfileFormRangesOption, EmployeeProfileI, EmployeeProfileLocationOption, EmployeeProfileStatus, ParsedPhoneNumber, Point } from '@shared/interfaces/EmployeeProfileI';
import { AvatarRef } from '@shared/interfaces/UserI';
import { Expose } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { DateRangeEntity } from './DateRangeEntity';
import { GeocodedPosition } from '@shared/interfaces/MapsInterfaces';


@Entity('jh_employee_profiles')
export class EmployeeProfileEntity implements EmployeeProfileI {

  @PrimaryGeneratedColumn({ name: 'employee_profile_id' })
  @Expose()
  employeeProfileId: number;

  @Column({ name: 'uid' })
  @Expose()
  uid: string;
  
  @Column({ name: 'status' })
  @Expose()
  status: EmployeeProfileStatus;
  
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
  locationOption: EmployeeProfileLocationOption;

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
  availabilityOption: EmployeeProfileAvailabilityOption;

  @OneToMany(
    () => DateRangeEntity,
    (range) => range.employeeProfile,
    { cascade: true, eager: true }
  )
  availabilityDateRanges?: DateRangeI[];

  @Column({ name: 'ranges_option', nullable: true })
  rangesOption?: EmployeeProfileFormRangesOption;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;
  
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
