import { Point } from "./EmployeeProfileI";

export interface OfferI {

    offerId: number;

    uid: string;
    status: OfferStatus;

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

    type?: OfferType;

    // salaryHourlyFrom?: number;
    // salaryHourlyTo?: number;

    // salaryMonthlyFrom?: number;
    // salaryMonthlyTo?: number;

    // currency?: Currency;

    salary: Salary | null;
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

export const OfferTypes = {
    LADDERS: 'LADDERS',
    SCAFFOLD: 'SCAFFOLD',
    WORK_PLATFORM: 'WORK_PLATFORM',
    LIFTS: 'LIFT',
} as const;
export type OfferType = typeof OfferTypes[keyof typeof OfferTypes];

export const Currencies = {
    EUR: 'EUR',
    USD: 'USD',
    PLN: 'PLN',
} as const;
export type Currency = typeof Currencies[keyof typeof Currencies];

export interface CreateOfferForm {

}