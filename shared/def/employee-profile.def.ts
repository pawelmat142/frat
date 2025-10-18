export interface EmployeeProfileForm {
    firstName: string;
    lastName: string;
    communicationLanguages: string[];
    residenceCountry: string;

    skills?: string[];
    certificates?: string[];

    locationOption: EmployeeProfileLocationOption;

    // IF SELECTED_COUNTRIES_EUROPE
    locationCountries?: string[];
    // IF DISTANCE
    locationDistancePosition?: Position;
    locationDistanceRadius?: number; // [km]
}

export const EmployeeProfileLocationOptions = {
    ALL_EUROPE: 'ALL_EUROPE',
    SELECTED_COUNTRIES_EUROPE: 'SELECTED_COUNTRIES_EUROPE',
    DISTANCE: 'DISTANCE',
} as const;

export type EmployeeProfileLocationOption = typeof EmployeeProfileLocationOptions[keyof typeof EmployeeProfileLocationOptions];


export interface Position {
    lat: number;
    lng: number;
    address?: string;
}
