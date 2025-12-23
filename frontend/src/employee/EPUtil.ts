import { EmmployeeProfileSearchSortOption, EmployeeProfileI, EmployeeProfileSearchFilters, Position } from "@shared/interfaces/EmployeeProfileI";
import { ObjUtil } from "@shared/utils/ObjUtil";
import { FilterUtil } from "global/utils/FilterUtil";

export abstract class EPUtil {

    private static readonly FREE_TEXT = 'q';
    private static readonly SKILLS = 'skills';
    private static readonly CERTIFICATES = 'certs';
    private static readonly COMMUNICATION_LANGUAGES = 'langs';
    private static readonly LOCATION_COUNTRY = 'country';
    private static readonly START_DATE = 'startDate';
    private static readonly END_DATE = 'endDate';
    private static readonly LAT = 'lat';
    private static readonly LNG = 'lng';


    private static readonly PAGE = 'page';
    private static readonly LIMIT = 'limit';
    private static readonly SORT_BY = 'sortBy';

    public static getDistanceFromToInMeters(from: Position, to: Position): number {
        const toRad = (deg: number) => deg * Math.PI / 180;
        const earthRadius = 6371e3; // Earth's radius in meters
        
        const lat1 = toRad(from.lat);
        const lat2 = toRad(to.lat);
        const deltaLat = toRad(to.lat - from.lat);
        const deltaLng = toRad(to.lng - from.lng);
        
        const a = Math.sin(deltaLat / 2) ** 2 + 
                  Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
        
        const distance = earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return distance;
    }

    public static formatDistance(distanceInMeters: number): string {
        if (distanceInMeters < 1000) {
            return `${Math.round(distanceInMeters)} m`;
        } else {
            return `${Math.round(distanceInMeters / 1000)} km`;
        }
    }

    public static prepareUrlParams = (f: EmployeeProfileSearchFilters, defaultFilters: EmployeeProfileSearchFilters): string => {
        const params = new URLSearchParams();
        if (f.freeText) params.set(EPUtil.FREE_TEXT, f.freeText);
        if (f.skills?.length) params.set(EPUtil.SKILLS, f.skills.join(','));
        if (f.certificates?.length) params.set(EPUtil.CERTIFICATES, f.certificates.join(','));
        if (f.communicationLanguages?.length) params.set(EPUtil.COMMUNICATION_LANGUAGES, f.communicationLanguages.join(','));
        if (f.locationCountry) params.set(EPUtil.LOCATION_COUNTRY, f.locationCountry);
        if (f.startDate) {
            params.set(EPUtil.START_DATE, f.startDate.toISOString());
            if (f.endDate) {
                params.set(EPUtil.END_DATE, f.endDate.toISOString());
            }
        }
        const page = Math.floor(f.skip / f.limit) + 1;
        if (page > 1) params.set(EPUtil.PAGE, String(page));
        if (f.limit !== defaultFilters.limit) params.set(EPUtil.LIMIT, String(f.limit));
        if (f.lat) params.set(EPUtil.LAT, String(f.lat));
        if (f.lng) params.set(EPUtil.LNG, String(f.lng));
        if (f.sortBy) params.set(EPUtil.SORT_BY, f.sortBy);
        const searchStr = params.toString();
        return searchStr;
    }

    public static parseFiltersFromSearch = (search: string, defaultFilters: EmployeeProfileSearchFilters): EmployeeProfileSearchFilters => {
        const params = new URLSearchParams(search);

        const freeText = params.get(EPUtil.FREE_TEXT) || '';
        const skills = FilterUtil.getArray(EPUtil.SKILLS, params);
        const certificates = FilterUtil.getArray(EPUtil.CERTIFICATES, params);
        const communicationLanguages = FilterUtil.getArray(EPUtil.COMMUNICATION_LANGUAGES, params);
        const locationCountry = params.get(EPUtil.LOCATION_COUNTRY) || null;
        const page = parseInt(params.get(EPUtil.PAGE) || '1', 10);
        const limit = parseInt(params.get(EPUtil.LIMIT) || String(defaultFilters.limit), 10);
        const skip = (page - 1) * limit;
        const startDate = params.get(EPUtil.START_DATE) ? new Date(params.get(EPUtil.START_DATE)!) : null;
        const endDate = params.get(EPUtil.END_DATE) ? new Date(params.get(EPUtil.END_DATE)!) : null;
        const sortBy = params.get(EPUtil.SORT_BY) as EmmployeeProfileSearchSortOption || defaultFilters.sortBy;
        return {
            freeText,
            skills,
            certificates,
            communicationLanguages,
            locationCountry,
            skip: skip < 0 ? 0 : skip,
            limit,
            startDate: startDate,
            endDate: endDate,
            sortBy,
            lat: FilterUtil.prepareNumberParam(params, EPUtil.LAT),
            lng: FilterUtil.prepareNumberParam(params, EPUtil.LNG),
        };
    }

    public static prepareName = (employeeProfile: EmployeeProfileI) => {
        let result = ``
        if (employeeProfile.firstName) {
            result += employeeProfile.firstName
        }
        if (employeeProfile.lastName) {
            if (employeeProfile.firstName) {
                result += ` `
            }
            result += `${employeeProfile.lastName}`
        }
        return `, (${result})`
    }

    public static filtersEquals = (f1: EmployeeProfileSearchFilters, f2: EmployeeProfileSearchFilters): boolean => {
        if (f1.freeText !== f2.freeText) return false;
        if (f1.locationCountry !== f2.locationCountry) return false;
        if (f1.startDate?.toISOString() !== f2.startDate?.toISOString()) return false;
        if (f1.endDate?.toISOString() !== f2.endDate?.toISOString()) return false;
        if (ObjUtil.arrayChanged(f1.skills, f2.skills)) return false;
        if (ObjUtil.arrayChanged(f1.certificates, f2.certificates)) return false;
        if (ObjUtil.arrayChanged(f1.communicationLanguages, f2.communicationLanguages)) return false;
        if (f1.lat !== f2.lat) return false;
        if (f1.lng !== f2.lng) return false;
        if (f1.skip !== f2.skip) return false;
        if (f1.limit !== f2.limit) return false;
        if (f1.sortBy !== f2.sortBy) return false;
        return true;
    }
}