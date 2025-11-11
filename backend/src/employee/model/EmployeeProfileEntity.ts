/** Created by Pawel Malek **/
import { EmployeeProfileI, EmployeeProfileLocationOption, EmployeeProfileStatus, Point } from '@shared/interfaces/EmployeeProfileI';
import { Expose } from 'class-transformer';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { DateRangeEntity } from './DateRangeEntity';


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
  
  @Column({ name: 'email', unique: true })
  @Expose()
  email: string;
  
  @Column({ name: 'first_name' })
  @Expose()
  firstName: string;
  
  @Column({ name: 'last_name' })
  @Expose()
  lastName: string;
  
  @Column({ name: 'residence_country' })
  @Expose()
  residenceCountry: string;


  
  
  @Column({ name: 'skills', type: 'text', array: true })
  skills: string[];
  
  @Column({ name: 'certificates', type: 'text', array: true })
  certificates: string[];
  
  
  @Column({ name: 'communication_languages', type: 'text', array: true })
  communicationLanguages: string[];


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

  @Column({ name: 'point_radius', type: 'int', nullable: true })
  pointRadius?: number;

  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;



  // AVAILABILITY DATES
  @Expose()
  @Column({ name: 'availability_option' })
  availabilityOption: EmployeeProfileLocationOption;

  @OneToMany(
    () => DateRangeEntity,
    (range) => range.employeeProfile,
    { cascade: true, eager: true }
  )
  dateRanges?: DateRangeEntity[];



  // AUDIT FIELDS
  @Expose()
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'version', type: 'int', default: 1, onUpdate: 'version + 1' })
  version: number;
}
