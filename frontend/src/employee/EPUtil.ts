import { EmmployeeProfileSearchSortOption, EmployeeProfileI, EmployeeProfileSearchFilters } from "@shared/interfaces/EmployeeProfileI";
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

        const freeText = params.get(EPUtil.FREE_TEXT) || undefined;
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
}