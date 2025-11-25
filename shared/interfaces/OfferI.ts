import { DateRange, Point, Position } from "./EmployeeProfileI";

export interface OfferI {

    offerId: number;

    uid: string;
    status: OfferStatus;
    category: string;

    displayName?: string;

    requiredSkills?: string[];
    niceToHaveSkills?: string[];

    requiredCertificates?: string[];
    niceToHaveCertificates?: string[];

    requiredLanguages?: string[];
    niceToHaveLanguages?: string[];

    locationCountry: string;
    point?: Point;
    displayAddress?: string;

    salary?: Salary | null;
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

export interface CreateOfferForm {
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
    position?: Position | null;
    range?: DateRange | null;
}

export interface OfferFormTwo {

}

export interface OfferFormThree {

}

export interface OfferFormFour {

}