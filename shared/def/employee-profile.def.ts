import { EmployeeProfileLocationOption } from "@shared/interfaces/EmployeeProfileI";

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