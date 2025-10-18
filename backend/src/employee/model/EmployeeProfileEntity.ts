/** Created by Pawel Malek **/
import { Point } from '@shared/def/employee-profile.def';
import { EmployeeProfileI, EmployeeProfileLocationOption, EmployeeProfileStatus } from '@shared/interfaces/EmployeeProfileI';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('jh_employee_profiles')
export class EmployeeProfileEntity implements EmployeeProfileI {

  @PrimaryGeneratedColumn({ name: 'employee_profile_id' })
  employeeProfileId: number;

  @Column({ name: 'uid', unique: true })
  uid: string;

  @Column({ name: 'status' })
  status: EmployeeProfileStatus;

  @Column({ name: 'display_name' })
  displayName: string;

  @Column({ name: 'email', unique: true })
  email: string;
  
  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'residence_country' })
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



  // AUDIT FIELDS
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column({ name: 'version', type: 'int', default: 1, onUpdate: 'version + 1' })
  version: number;
}
