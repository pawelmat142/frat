import { EmployeeProfileLocationOption, Position } from "@shared/def/employee-profile.def";

export interface EmployeeProfileFormValues {
    firstName: string;
    lastName: string;
    communicationLanguages: string[];
    residenceCountry: string;

    locationOption: EmployeeProfileLocationOption;

    // IF SELECTED_COUNTRIES_EUROPE
    locationCountries?: string[];
    // IF DISTANCE
    locationDistancePosition?: Position;
    locationDistanceRadius?: number; // [km]
}