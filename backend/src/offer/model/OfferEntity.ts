import { Point } from "@shared/interfaces/EmployeeProfileI";
import { Currencies, Currency, OfferI, OfferStatus, Salary, SalaryTypes } from "@shared/interfaces/OfferI";
import { Expose } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('jh_offers')
export class OfferEntity implements OfferI {

    @PrimaryGeneratedColumn({ name: 'offer_id' })
    @Expose()
    offerId: number;

    @Column({ name: 'uid' })
    @Expose()
    uid: string;

    @Column({ name: 'status' })
    @Expose()
    status: OfferStatus;

    // BASIC FIELDS
    @Column({ name: 'category' })
    @Expose()
    category: string;

    @Column({ name: 'location_country' })
    @Expose()
    locationCountry: string;

    @Column({ name: 'display_address', nullable: true })
    @Expose()
    displayAddress?: string;

    @Column({ name: 'start_date', type: 'date' })
    @Expose()
    startDate: Date;

    @Column({ name: 'end_date', type: 'date', nullable: true })
    @Expose()
    endDate?: Date;

    @Column({ name: 'open_slots', type: 'int', default: 0 })
    @Expose()
    availableSlots: number;

    @Column({ name: 'applied_slots', type: 'int', default: 0 })
    @Expose()
    appliedSlots: number;

    @Column({ name: 'accepted_slots', type: 'int', default: 0 })
    @Expose()
    acceptedSlots: number;

    // REQUIREMENTS FIELDS
    @Column({ name: 'skills_required', type: 'text', array: true, nullable: true })
    @Expose()
    skillsRequired?: string[];

    @Column({ name: 'skills_nice_to_have', type: 'text', array: true, nullable: true })
    @Expose()
    skillsNiceToHave?: string[];

    @Column({ name: 'certificates_required', type: 'text', array: true, nullable: true })
    @Expose()
    certificatesRequired?: string[];

    @Column({ name: 'certificates_nice_to_have', type: 'text', array: true, nullable: true })
    @Expose()
    certificatesNiceToHave?: string[];

    @Column({ name: 'languages_required', type: 'text', array: true, nullable: true })
    @Expose()
    languagesRequired?: string[];

    @Column({ name: 'languages_nice_to_have', type: 'text', array: true, nullable: true })
    @Expose()
    languagesNiceToHave?: string[];


    // SALARY FIELDS
    @Column({ name: 'salary_hourly_from', type: 'int', nullable: true })
    @Expose()
    hourlySalaryStart?: number;

    @Column({ name: 'salary_hourly_to', type: 'int', nullable: true })
    @Expose()
    hourlySalaryEnd?: number;

    @Column({ name: 'salary_monthly_from', type: 'int', nullable: true })
    @Expose()
    monthlySalaryStart?: number;

    @Column({ name: 'salary_monthly_to', type: 'int', nullable: true })
    @Expose()
    monthlySalaryEnd?: number;

    @Column({ name: 'currency', nullable: true })
    @Expose()
    currency?: Currency;

    // DETAILS FIELDS
    @Column({ name: 'display_name', nullable: true })
    @Expose()
    displayName?: string;

    @Column({ name: 'description', nullable: true })
    @Expose()
    description?: string;


    // AUDIT FIELDS
    @Column({ name: 'views', type: 'text', array: true, default: [] })
    @Expose()
    views: string[];

    @Column({ name: 'likes', type: 'text', array: true, default: [] })
    @Expose()
    likes: string[];

    @Column({ name: 'shares', type: 'text', array: true, default: [] })
    @Expose()
    shares: string[];

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    @Expose()
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamptz', nullable: true })
    @Expose()
    updatedAt?: Date;

    get salary(): Salary | null {
        if (!this.hourlySalaryStart && !this.monthlySalaryStart) {
            return null;
        }
        const result: Salary = {
            currency: this.currency || Currencies.EUR,
        }
        if (this.monthlySalaryStart) {
            result.monthly = {
                from: this.monthlySalaryStart,
                to: this.monthlySalaryEnd,
                type: SalaryTypes.MONTHLY
            }
        }
        if (this.hourlySalaryStart) {
            result.hourly = {
                from: this.hourlySalaryStart,
                to: this.hourlySalaryEnd,
                type: SalaryTypes.HOURLY
            }
        }
        return result;
    }


}