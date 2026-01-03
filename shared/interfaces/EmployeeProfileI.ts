import { GeocodedPosition, Position } from './MapsInterfaces';
import { AvatarRef } from './UserI';

export interface ParsedPhoneNumber {
  prefix: string;
  phoneNumber: string;
}

export interface EmployeeProfileI {

  employeeProfileId: number;

  // user data
  uid: string;
  status: EmployeeProfileStatus;
  displayName: string;

  fullName: string;
  phoneNumber: ParsedPhoneNumber;
  email: string;
  communicationLanguages: string[];
  // TODO usunac wszystkie inne avatary z clouda od tego uid przy submicie forma
  avatarRef: AvatarRef;
  bio?: string;

  // 
  locationOption: EmployeeProfileLocationOption;
  locationCountries?: string[];
  point?: Point;
	fullAddress?: string;
  geocodedPosition?: GeocodedPosition;

  // 
  availabilityOption: EmployeeProfileAvailabilityOption;
  availabilityDateRanges?: DateRangeI[];
  rangesOption?: EmployeeProfileFormRangesOption;
  startDate: Date | null;

// 
  experience?: string[];
  certificates?: string[];


  views: string[];
  jobs: string[];
  likes: string[];

  createdAt: Date;
}

export const EmployeeProfileStatuses = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const;
export type EmployeeProfileStatus = typeof EmployeeProfileStatuses[keyof typeof EmployeeProfileStatuses];


export const EmployeeProfileLocationOptions = {
  ALL_EUROPE: 'ALL_EUROPE',
  SELECTED_COUNTRIES: 'SELECTED_COUNTRIES',
  POSITION: 'POSITION',
} as const;
export type EmployeeProfileLocationOption = typeof EmployeeProfileLocationOptions[keyof typeof EmployeeProfileLocationOptions];


export const EmployeeProfileAvailabilityOptions = {
  ANYTIME: 'ANYTIME',
  FROM_DATE: 'FROM_DATE',
  DATE_RANGES: 'DATE_RANGES',
} as const;
export type EmployeeProfileAvailabilityOption = typeof EmployeeProfileAvailabilityOptions[keyof typeof EmployeeProfileAvailabilityOptions];

export const EmployeeProfileFormRangesOptions = {
  AVAILABLE_ON: 'AVAILABLE_ON',
  NOT_AVAILABLE_ON: 'NOT_AVAILABLE_ON',
} as const;
export type EmployeeProfileFormRangesOption = typeof EmployeeProfileFormRangesOptions[keyof typeof EmployeeProfileFormRangesOptions];

export interface EmployeeProfileFormStep1 {
  fullName: string;
  phoneNumber: ParsedPhoneNumber;
  email: string;
  communicationLanguages: string[];
  avatarRef: AvatarRef;
  bio?: string;
}

export interface EmployeeProfileFormStep2 {
  locationOption: EmployeeProfileLocationOption;
  countryCode?: string;
  geocodedPosition?: GeocodedPosition | null;
  locationCountries?: string[];
}

export interface EmployeeProfileFormStep3 {
  availabilityOption: EmployeeProfileAvailabilityOption;
  availabilityDateRanges?: DateRange[];
  rangesOption?: EmployeeProfileFormRangesOption;
  startDate?: Date | null;
}

export interface EmployeeProfileFormStep4 {
  certificates?: string[];
  experience?: string[];
}

export interface EmployeeProfileForm {
  step1: EmployeeProfileFormStep1;
  step2: EmployeeProfileFormStep2;
  step3: EmployeeProfileFormStep3;
  step4: EmployeeProfileFormStep4;
}

// Flat API structure for backend communication
export interface EmployeeProfileFormDto {
  fullName: string;
  phoneNumber: ParsedPhoneNumber;
  email: string;
  communicationLanguages: string[];
  avatarRef: AvatarRef;
  // TODO dodac do forma
  bio?: string;

  locationOption: EmployeeProfileLocationOption;
// EmployeeProfileLocationOptions.POSITION
  countryCode?: string;
  geocodedPosition?: GeocodedPosition;
// EmployeeProfileLocationOptions.SELECTED_COUNTRIES
  locationCountries?: string[];

  availabilityOption: EmployeeProfileAvailabilityOption;
  availabilityDateRanges?: DateRange[];
  rangesOption?: EmployeeProfileFormRangesOption;
  startDate?: Date | null;

  experience?: string[];
  certificates?: string[];
}

export interface EmployeeProfileSearchFilters {
  freeText: string;

  communicationLanguages?: string[];
  skills?: string[];
  certificates?: string[];

  locationCountry?: string | null;
  locationPosition?: Position;

  startDate?: Date | null;
  endDate?: Date | null;

  position?: Position | null;

  sortBy: EmmployeeProfileSearchSortOption
  skip: number;
  limit: number;
}

export interface EmployeeProfileSearchResponse {
  profiles: EmployeeProfileI[];
  count: number;
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

export const EmmployeeProfileSearchSortOptions = {
  START_FROM_DESC: 'START_FROM_DESC',
  START_FROM_ASC: 'START_FROM_ASC',
  CREATED_AT_DESC: 'CREATED_AT_DESC',
  CREATED_AT_ASC: 'CREATED_AT_ASC',
  DISTANCE_ASC: 'DISTANCE_ASC',
  POPULARITY: 'POPULARITY',
} as const;

export type EmmployeeProfileSearchSortOption = typeof EmmployeeProfileSearchSortOptions[keyof typeof EmmployeeProfileSearchSortOptions];

export const PROFILE_DEFAULT_SORT_OPTION: EmmployeeProfileSearchSortOption = EmmployeeProfileSearchSortOptions.START_FROM_DESC;

export const PROFILES_INITIAL_SEARCH_LIMIT = 12;
export const PROFILES_LOAD_MORE_SEARCH_LIMIT = 4;

export const DEFAULT_SEARCH_DISTANCE_M = 1000000;