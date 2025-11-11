import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from "typeorm";
import { EmployeeProfileEntity } from "./EmployeeProfileEntity";
import { DateRangeI } from "@shared/interfaces/EmployeeProfileI";

/**
 * Encja dla pojedynczego zakresu dostępności pracownika
 */
@Entity('jh_employee_profile_availability_date_ranges')
export class DateRangeEntity implements DateRangeI {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @ManyToOne(() => EmployeeProfileEntity, profile => profile.availabilityDateRanges, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_profile_id' })
  employeeProfile: EmployeeProfileEntity;

  @Column({ name: 'date_range', type: 'daterange' })
  dateRange: string;
}