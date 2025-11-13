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

export interface EmployeeProfileForm {
  firstName: string;
  lastName: string;
  communicationLanguages: string[];
  residenceCountry: string;

  skills?: string[];
  certificates?: string[];

  // LOCATION
  locationOption: EmployeeProfileLocationOption;
  // if SELECTED_COUNTRIES_EUROPE
  locationCountries?: string[];
  // if DISTANCE
  locationDistancePosition?: Position;
  locationDistanceRadius?: number; // [km]

  // AVAILABILITY DATES
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

  dateRange?: { start?: Date, end?: Date };

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