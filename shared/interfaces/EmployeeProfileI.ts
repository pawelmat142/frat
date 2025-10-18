import { Point } from "@shared/def/employee-profile.def";

export interface EmployeeProfileI {

    // user data
    uid: string;
    status: EmployeeProfileStatus;
    displayName: string;
    email: string;

    // form data
    firstName: string;
    lastName: string;
    residenceCountry: string;

    skills?: string[];
    certificates?: string[];

    communicationLanguages: string[];

    locationOption: EmployeeProfileLocationOption;
    locationCountries?: string[];
    point?: Point
    pointRadius?: number; // [km]
    address?: string; // derived field for distance location option
}

export const EmployeeProfileStatuses = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
} as const;
export type EmployeeProfileStatus = typeof EmployeeProfileStatuses[keyof typeof EmployeeProfileStatuses];


export const EmployeeProfileLocationOptions = {
    ALL_EUROPE: 'ALL_EUROPE',
    SELECTED_COUNTRIES_EUROPE: 'SELECTED_COUNTRIES_EUROPE',
    DISTANCE: 'DISTANCE',
} as const;
export type EmployeeProfileLocationOption = typeof EmployeeProfileLocationOptions[keyof typeof EmployeeProfileLocationOptions];

