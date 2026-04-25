import { ParsedPhoneNumber, Point } from "@shared/interfaces/WorkerI";
import { Currency, OfferI, OfferStatus } from "@shared/interfaces/OfferI";
import { Expose } from "class-transformer";
import { Column, Entity, PrimaryGeneratedColumn, ValueTransformer } from "typeorm";

const dateTransformer: ValueTransformer = {
    to: (value?: Date | null) => value ?? null,
    from: (value: any) => {
        if (!value) {
            return value;
        }
        return value instanceof Date ? value : new Date(value);
    },
};


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

    @Column({ name: 'start_date', type: 'date', transformer: dateTransformer })
    @Expose()
    startDate: Date;

    @Column({ name: 'languages_required', type: 'text', array: true, nullable: true })
    @Expose()
    languagesRequired?: string[];

    @Column({ name: 'phone_number', type: 'jsonb' })
    @Expose()
    phoneNumber: ParsedPhoneNumber;

    @Column({ name: 'location_country' })
    @Expose()
    locationCountry: string;

    @Column({
        type: 'geography',
        spatialFeatureType: 'Point',
        srid: 4326,
        nullable: true,
    })
    point?: Point

    @Column({ name: 'display_address', nullable: true })
    @Expose()
    displayAddress?: string;



    // DETAILS FIELDS
    @Column({ name: 'display_name' })
    @Expose()
    displayName: string;

    @Column({ name: 'salary', type: 'int' })
    salary: number;

    @Column({ name: 'currency' })
    @Expose()
    currency: Currency;

    @Column({ name: 'description', nullable: true })
    @Expose()
    description?: string;


    // slots
    @Column({ name: 'open_slots', type: 'int', default: 0 })
    @Expose()
    availableSlots: number;

    @Column({ name: 'applied_slots', type: 'int', default: 0 })
    @Expose()
    appliedSlots: number;

    @Column({ name: 'accepted_slots', type: 'int', default: 0 })
    @Expose()
    acceptedSlots: number;


    // STATS
    @Column({ name: 'unique_views_count', type: 'int', default: 0 })
    @Expose()
    uniqueViewsCount: number;
    
    @Column({ name: 'favorites_count', type: 'int', default: 0 })
    @Expose()    
    favoritesCount: number;

    @Column({ name: 'created_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    @Expose()
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamptz', nullable: true })
    @Expose()
    updatedAt?: Date;
}