import { Point } from "@shared/interfaces/EmployeeProfileI";
import { Currencies, Currency, OfferI, OfferStatus, OfferType, Salary, SalaryTypes } from "@shared/interfaces/OfferI";
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

    @Column({ name: 'type' })
    @Expose()
    type: OfferType;

    @Column({ name: 'display_name', nullable: true })
    @Expose()
    displayName?: string;

    @Column({ name: 'required_skills', type: 'text', array: true, nullable: true })
    @Expose()
    requiredSkills?: string[];

    @Column({ name: 'nice_to_have_skills', type: 'text', array: true, nullable: true })
    @Expose()
    niceToHaveSkills?: string[];

    @Column({ name: 'required_certificates', type: 'text', array: true, nullable: true })
    @Expose()
    requiredCertificates?: string[];

    @Column({ name: 'nice_to_have_certificates', type: 'text', array: true, nullable: true })
    @Expose()
    niceToHaveCertificates?: string[];

    @Column({ name: 'required_languages', type: 'text', array: true, nullable: true })
    @Expose()
    requiredLanguages?: string[];

    @Column({ name: 'nice_to_have_languages', type: 'text', array: true, nullable: true })
    @Expose()
    niceToHaveLanguages?: string[];

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
    salaryHourlyFrom?: number;
    
    @Column({ name: 'salary_hourly_to', type: 'int', nullable: true })
    @Expose()
    salaryHourlyTo?: number;

    @Column({ name: 'salary_monthly_from', type: 'int', nullable: true })
    @Expose()
    salaryMonthlyFrom?: number;
    
    @Column({ name: 'salary_monthly_to', type: 'int', nullable: true })
    @Expose()
    salaryMonthlyTo?: number;

    @Column({ name: 'currency', nullable: true })
    @Expose()
    currency?: Currency;

    get salary(): Salary | null {
        if (!this.salaryHourlyFrom && !this.salaryMonthlyFrom) {
            return null;
        }
        const result: Salary = {
            currency: this.currency || Currencies.EUR,
        }
        if (this.salaryMonthlyFrom) {
            result.monthly = {
                from: this.salaryMonthlyFrom,
                to: this.salaryMonthlyTo,
                type: SalaryTypes.MONTHLY
            }
        }
        if (this.salaryHourlyFrom) {
            result.hourly = {
                from: this.salaryHourlyFrom,
                to: this.salaryHourlyTo,
                type: SalaryTypes.HOURLY
            }
        }
        return result;
    }


}