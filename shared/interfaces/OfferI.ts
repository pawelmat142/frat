import { ParsedPhoneNumber, Point } from "./WorkerProfileI";
import { GeocodedPosition } from "./MapsInterfaces";

export interface OfferI {

    offerId: number
    uid: string
    status: OfferStatus

    // BASIC FIELDS
    category: string
    startDate: Date
    languagesRequired?: string[]
    phoneNumber: ParsedPhoneNumber;

    locationCountry: string
    displayAddress?: string
    point?: Point

   // DETAILS FIELDS    
    displayName?: string
    currency?: Currency;
    salary?: number;
    description?: string

    availableSlots: number
    // TODO power fields
    appliedSlots: number
    // TODO power fields
    acceptedSlots: number


    // AUDIT FIELDS
    views: string[]     //uids of profiles who viewed the offer
    likes: string[]     //uids of profiles who liked the offer
    // TODO power fields
    shares: string[]    //uids of profiles who shared the offer
    createdAt: Date
    updatedAt?: Date
}


export interface Salary {
    hourly?: SalaryRange;
    monthly?: SalaryRange;
    currency: Currency;
}

export interface SalaryRange {
    from: number;
    to?: number;
    type: SalaryType;
}

export const SalaryTypes = {
    HOURLY: 'HOURLY',
    MONTHLY: 'MONTHLY',
} as const;
export type SalaryType = typeof SalaryTypes[keyof typeof SalaryTypes];

export const OfferStatuses = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
} as const;
export type OfferStatus = typeof OfferStatuses[keyof typeof OfferStatuses];

export const Currencies = {
    EUR: 'EUR',
    USD: 'USD',
    PLN: 'PLN',
} as const;
export type Currency = typeof Currencies[keyof typeof Currencies];

export interface OfferForm {
    currentStep: OfferFormStep;
    STEP_ONE: OfferFormOne;
    STEP_TWO?: OfferFormTwo;
    STEP_THREE?: OfferFormThree;
}

export const OfferFormSteps = {
    STEP_ONE: 'STEP_ONE',
    STEP_TWO: 'STEP_TWO',
    STEP_THREE: 'STEP_THREE',
} as const;
export type OfferFormStep = typeof OfferFormSteps[keyof typeof OfferFormSteps];

export const OFFER_STEPS_ORDER = [
    OfferFormSteps.STEP_ONE,
    OfferFormSteps.STEP_TWO,
    OfferFormSteps.STEP_THREE,
]

export interface OfferFormOne {
    category: string | null;
    startDate: string | null;
    communicationLanguages: string[];
    phoneNumber: ParsedPhoneNumber | null;
}

export interface OfferFormTwo {
    locationCountry: string | null;
    geocodedPosition: GeocodedPosition | null;
}

export interface OfferFormThree {
    displayName: string | null;
    currency: Currency | null;
    salary: number | null;
    description?: string | null;
}

export interface OfferSearchFilters {

    locationCountries?: string[]
    communicationLanguages?: string[];
    categories?: string[];

    skip: number;
    limit: number;
}

export interface OfferSearchResponse {
  offers: OfferI[];
  count: number;
}