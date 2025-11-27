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

    @Column({ name: 'category' })
    @Expose()
    category: string;

    @Column({ name: 'display_name', nullable: true })
    @Expose()
    displayName?: string;

    @Column({ name: 'description', nullable: true })
    @Expose()
    description?: string;

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

    @Column({ name: 'location_country' })
    @Expose()
    locationCountry: string;

    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    })
    point?: Point;

    @Column({ name: 'display_address', nullable: true })
    @Expose()
    displayAddress?: string;

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