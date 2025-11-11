export interface EmployeeProfileI {

    employeeProfileId: number;

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

    createdAt: Date;
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

export interface EmployeeProfileSearchForm {
  freeText?: string;

  communicationLanguages?: string[];
  skills?: string[];
  certificates?: string[];
  
  locationCountry?: string | null;
  locationPosition?: Position;

  skip: number;
  limit: number;
}

export interface EmployeeProfileSearchResponse {
  profiles: EmployeeProfileI[];
  count: number;
}

export interface Position {
  lat: number;
  lng: number;
  address?: string;
}

export interface Point {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}