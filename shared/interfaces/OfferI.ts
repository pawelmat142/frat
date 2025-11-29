import { DateRange, Point, Position } from "./EmployeeProfileI";

export interface OfferI {

    offerId: number
    uid: string
    status: OfferStatus

    // BASIC FIELDS
    category: string

    locationCountry: string
    displayAddress?: string

    startDate: Date
    endDate?: Date

    availableSlots: number
    // TODO power fields
    appliedSlots: number
    // TODO power fields
    acceptedSlots: number


    // REQUIREMENTS FIELDS
    skillsRequired?: string[]
    skillsNiceToHave?: string[]

    certificatesRequired?: string[]
    certificatesNiceToHave?: string[]

    languagesRequired?: string[]
    languagesNiceToHave?: string[]



    // SALARY FIELDS
    hourlySalaryStart?: number;
    hourlySalaryEnd?: number;
    monthlySalaryStart?: number;
    monthlySalaryEnd?: number;
    currency?: Currency;

    // DETAILS FIELDS    
    displayName?: string
    description?: string

    // AUDIT FIELDS
    // TODO power fields
    views: string[]     //uids of profiles who viewed the offer
    // TODO power fields
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
    locationCountry: string | null;
    displayAddress?: string | null;
    position?: Position | null;
    dateRange?: DateRange | null;
    availableSlots?: number | null;
}

export interface OfferFormTwo {
    skillsRequired?: string[];
    skillsNiceToHave?: string[];
    certificatesRequired?: string[];
    certificatesNiceToHave?: string[];
    languagesRequired?: string[];
    languagesNiceToHave?: string[];
}

export interface OfferFormThree {
    monthlySalaryStart?: string | null;
    monthlySalaryEnd?: string | null;
    hourlySalaryStart?: string | null;
    hourlySalaryEnd?: string | null;
    currency?: Currency | null;
}

export interface OfferFormFour {
    displayName?: string | null;
    description?: string | null;
}