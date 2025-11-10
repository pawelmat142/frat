import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";

export interface CountryFeature {
    type: 'Feature';
    properties: {
        name: string;
        'ISO3166-1-Alpha-3': string;
        'ISO3166-1-Alpha-2': string;
        [key: string]: any;
    };
    geometry: {
        type: string;
        coordinates: any;
    };
}

export type EmployeeProfileParams = Partial<EmployeeProfileI>;
