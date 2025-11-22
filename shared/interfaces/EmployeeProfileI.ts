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
  // residenceCountry: string;

  skills?: string[];
  certificates?: string[];

  communicationLanguages: string[];

  locationOption: EmployeeProfileLocationOption;
  locationCountries?: string[];
  point?: Point
  pointRadius?: number; // [km]
  address?: string; // derived field for distance location option

  // availability dates
  availabilityOption: EmployeeProfileAvailabilityOption;
  availabilityDateRanges?: DateRangeI[];

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


export const EmployeeProfileAvailabilityOptions = {
  ANYTIME: 'ANYTIME',
  FROM_DATE: 'FROM_DATE',
  DATE_RANGES: 'DATE_RANGES',
} as const;
export type EmployeeProfileAvailabilityOption = typeof EmployeeProfileAvailabilityOptions[keyof typeof EmployeeProfileAvailabilityOptions];

export interface EmployeeProfileFormStep1 {
  firstName: string;
  lastName: string;
  communicationLanguages: string[];
  // residenceCountry: string;
}

export interface EmployeeProfileFormStep2 {
  skills: string[];
  certificates: string[];
}

export interface EmployeeProfileFormStep3 {
  locationOption: EmployeeProfileLocationOption;
  locationCountries?: string[];
  locationDistancePosition?: Position;
  locationDistanceRadius?: number; // [km]
}

export interface EmployeeProfileFormStep4 {
  availabilityOption: EmployeeProfileAvailabilityOption;
  availabilityDateRanges?: DateRange[];
}

export interface EmployeeProfileForm {
  step1: EmployeeProfileFormStep1;
  step2: EmployeeProfileFormStep2;
  step3: EmployeeProfileFormStep3;
  step4: EmployeeProfileFormStep4;
}

// Flat API structure for backend communication
export interface EmployeeProfileFormDto {
  firstName: string;
  lastName: string;
  communicationLanguages: string[];
  // residenceCountry: string;

  skills?: string[];
  certificates?: string[];

  locationOption: EmployeeProfileLocationOption;
  locationCountries?: string[];
  locationDistancePosition?: Position;
  locationDistanceRadius?: number; // [km]

  availabilityOption: EmployeeProfileAvailabilityOption;
  availabilityDateRanges?: DateRange[];
}

export interface EmployeeProfileSearchForm {
  freeText?: string;

  communicationLanguages?: string[];
  skills?: string[];
  certificates?: string[];

  locationCountry?: string | null;
  locationPosition?: Position;

  dateRange?: DateRange | null;

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

export interface DateRangeI {
  id: number;
  dateRange: string;
}

export interface DateRange {
  start?: Date | null
  end?: Date | null
  id?: number
}