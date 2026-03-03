import { CertificateI } from './CertificateI';
import { GeocodedPosition } from './MapsInterfaces';
import { AvatarRef } from './UserI';

export interface ParsedPhoneNumber {
  prefix: string;
  phoneNumber: string;
}

export interface WorkerI {

  workerId: number;

  // user data
  uid: string;
  status: WorkerStatus;
  displayName: string;

  fullName: string;
  phoneNumber: ParsedPhoneNumber;
  email: string;
  communicationLanguages: string[];
  avatarRef: AvatarRef;
  bio?: string;

  // 
  locationOption: WorkerLocationOption;
  locationCountries?: string[];
  point?: Point;
  fullAddress?: string;
  geocodedPosition?: GeocodedPosition;

  // 
  availabilityOption: WorkerAvailabilityOption;
  availabilityDateRanges?: DateRangeI[];
  rangesOption?: WorkerFormRangesOption;
  /** Local date string in YYYY-MM-DD format */
  startDate: string | null;

  // 
  categories?: string[];
  certificates?: string[];

  views: string[];
  jobs: string[];
  likes: string[];

  createdAt: Date;
}

export interface WorkerWithCertificates extends WorkerI {
  certs: CertificateI[];
}

export interface WorkerWithMutualFriends extends WorkerI {
  mutualFriendsUids: string[];
}

export const WorkerStatuses = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE'
} as const;
export type WorkerStatus = typeof WorkerStatuses[keyof typeof WorkerStatuses];


export const WorkerLocationOptions = {
  ALL_EUROPE: 'ALL_EUROPE',
  SELECTED_COUNTRIES: 'SELECTED_COUNTRIES',
  POSITION: 'POSITION',
} as const;
export type WorkerLocationOption = typeof WorkerLocationOptions[keyof typeof WorkerLocationOptions];


export const WorkerAvailabilityOptions = {
  ANYTIME: 'ANYTIME',
  FROM_DATE: 'FROM_DATE',
  DATE_RANGES: 'DATE_RANGES',
} as const;
export type WorkerAvailabilityOption = typeof WorkerAvailabilityOptions[keyof typeof WorkerAvailabilityOptions];

export const WorkerFormRangesOptions = {
  AVAILABLE_ON: 'AVAILABLE_ON',
  NOT_AVAILABLE_ON: 'NOT_AVAILABLE_ON',
} as const;
export type WorkerFormRangesOption = typeof WorkerFormRangesOptions[keyof typeof WorkerFormRangesOptions];

export interface WorkerFormStep1 {
  fullName: string;
  phoneNumber: ParsedPhoneNumber;
  email: string;
  communicationLanguages: string[];
  avatarRef: AvatarRef;
  // TODO - add step for bio and move it there
  bio?: string;
}

export interface WorkerFormStep2 {
  locationOption: WorkerLocationOption;
  countryCode?: string;
  geocodedPosition?: GeocodedPosition | null;
  locationCountries?: string[];
}

export interface WorkerFormStep3 {
  availabilityOption: WorkerAvailabilityOption;
  availabilityDateRanges?: DateRange[];
  rangesOption?: WorkerFormRangesOption;
  /** Local date string in YYYY-MM-DD format */
  startDate?: string | null;
}

export interface WorkerFormStep4 {
  certificates?: string[];
  certificateDates?: { [key: string]: string }; // key is certificate name, value is local date string in YYYY-MM-DD format
}

export interface WorkerForm {
  step1: WorkerFormStep1;
  step2: WorkerFormStep2;
  step3: WorkerFormStep3;
  step4: WorkerFormStep4;
}

// Flat API structure for backend communication
export interface WorkerFormDto {
  fullName: string;
  phoneNumber: ParsedPhoneNumber;
  email: string;
  communicationLanguages: string[];
  avatarRef: AvatarRef;
  bio?: string;

  locationOption: WorkerLocationOption;
  // WorkerLocationOptions.POSITION
  countryCode?: string;
  geocodedPosition?: GeocodedPosition;
  // WorkerLocationOptions.SELECTED_COUNTRIES
  locationCountries?: string[];

  availabilityOption: WorkerAvailabilityOption;
  availabilityDateRanges?: DateRange[];
  rangesOption?: WorkerFormRangesOption;
  /** Local date string in YYYY-MM-DD format */
  startDate?: string | null;

  certificates?: string[];
  certificateDates?: { [key: string]: string }; // key is certificate code, value is local date string in YYYY-MM-DD format
}

export interface WorkerSearchFilters {
  startDate?: string | null;
  endDate?: string | null;

  locationCountry: string | null;
  geocodedPosition?: GeocodedPosition | null;
  positionRadiusKm?: number;

  certificates?: string[];
  categories?: string[];
  communicationLanguages?: string[];

  sortBy?: WorkerSearchSortOption;
  skip: number;
  limit: number;
}

export interface WorkerSearchRequest {
  startDate?: string | null;
  endDate?: string | null;

  locationCountry: string | null;
  lat?: number;
  lng?: number;
  positionRadiusKm?: number;

  certificates?: string[];
  categories?: string[];
  communicationLanguages?: string[];

  sortBy?: WorkerSearchSortOption;
  skip: number;
  limit: number;
}

export interface WorkerSearchResponse {
  profiles: WorkerWithMutualFriends[];
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

/** Date range with local date strings in YYYY-MM-DD format */
export interface DateRange {
  /** Local date string in YYYY-MM-DD format */
  start?: string | null
  /** Local date string in YYYY-MM-DD format */
  end?: string | null
  id?: number
}

export const WorkerSearchSortOptions = {
  MUTUAL_FRIENDS: 'MUTUAL_FRIENDS',
  START_FROM_DESC: 'START_FROM_DESC',
  START_FROM_ASC: 'START_FROM_ASC',
  CREATED_AT_DESC: 'CREATED_AT_DESC',
  CREATED_AT_ASC: 'CREATED_AT_ASC',
  DISTANCE_ASC: 'DISTANCE_ASC',
  POPULARITY: 'POPULARITY',
} as const;
export type WorkerSearchSortOption = typeof WorkerSearchSortOptions[keyof typeof WorkerSearchSortOptions];

// move to config
export const DefaultWorkerSearchSortOption: WorkerSearchSortOption = WorkerSearchSortOptions.MUTUAL_FRIENDS;

export const PROFILES_INITIAL_SEARCH_LIMIT = 12;
export const PROFILES_LOAD_MORE_SEARCH_LIMIT = 4;

export const DEFAULT_SEARCH_DISTANCE_M = 1000000;