import { ParsedPhoneNumber, Point } from "./WorkerI";
import { GeocodedPosition } from "./MapsInterfaces";
import { FileRef } from "./UserI";

export interface OfferI {

    offerId: string
    uid: string
    status: OfferStatus

    // BASIC FIELDS
    category: string
    startDate: Date
    languagesRequired?: string[]
    requiredCertificates?: string[]
    phoneNumber: ParsedPhoneNumber;

    locationCountry: string
    displayAddress?: string
    point?: Point

    // DETAILS FIELDS    
    displayName?: string
    currency?: Currency;
    salary?: number;
    description?: string
    avatarRef?: FileRef

    availableSlots: number
    // TODO power fields
    appliedSlots: number
    // TODO power fields
    acceptedSlots: number


    // STATS
    uniqueViewsCount: number;
    favoritesCount: number

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
    offerId: string;
    STEP_ONE: OfferFormOne;
    STEP_TWO?: OfferFormTwo;
    STEP_THREE?: OfferFormThree;
    STEP_FOUR?: OfferFormFour;
}

export const OfferFormSteps = {
    STEP_ONE: 'STEP_ONE',
    STEP_TWO: 'STEP_TWO',
    STEP_THREE: 'STEP_THREE',
    STEP_FOUR: 'STEP_FOUR',
} as const;
export type OfferFormStep = typeof OfferFormSteps[keyof typeof OfferFormSteps];

export const OFFER_STEPS_ORDER = [
    OfferFormSteps.STEP_ONE,
    OfferFormSteps.STEP_TWO,
    OfferFormSteps.STEP_THREE,
    OfferFormSteps.STEP_FOUR,
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
    avatarRef?: FileRef | null;
}

export interface OfferFormFour {
    requiredCertificates?: string[];
}

export interface OfferSearchFilters {

    locationCountries?: string[]
    communicationLanguages?: string[];
    categories?: string[];
    startDate?: string | null;

    sortBy?: OfferSearchSortOption;
    skip: number;
    limit: number;
}

export interface OfferSearchResponse {
    offers: OfferI[];
    count: number;
}

export const OfferSearchSortOptions = {
    DISTANCE_ASC: 'DISTANCE_ASC',
    START_FROM_ASC: 'START_FROM_ASC',
    START_FROM_DESC: 'START_FROM_DESC',
    CREATED_AT_ASC: 'CREATED_AT_ASC',
    CREATED_AT_DESC: 'CREATED_AT_DESC',
} as const;
export type OfferSearchSortOption = typeof OfferSearchSortOptions[keyof typeof OfferSearchSortOptions];