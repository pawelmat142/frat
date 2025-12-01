import { EmployeeProfileI, EmployeeProfileSearchFilters } from "@shared/interfaces/EmployeeProfileI";
import { FilterUtil } from "global/FilterUtil";

export abstract class EPUtil {

    public static prepareUrlParams = (f: EmployeeProfileSearchFilters, defaultFilters: EmployeeProfileSearchFilters) => {
        const params = new URLSearchParams();
        if (f.freeText) params.set('q', f.freeText);
        if (f.skills?.length) params.set('skills', f.skills.join(','));
        if (f.certificates?.length) params.set('certs', f.certificates.join(','));
        if (f.communicationLanguages?.length) params.set('langs', f.communicationLanguages.join(','));
        if (f.locationCountry) params.set('country', f.locationCountry);
        if (f.startDate) {
            params.set('startDate', f.startDate.toISOString());
            if (f.endDate) {
                params.set('endDate', f.endDate.toISOString());
            }
        }
        const page = Math.floor(f.skip / f.limit) + 1;
        if (page > 1) params.set('page', String(page));
        if (f.limit !== defaultFilters.limit) params.set('limit', String(f.limit));
        if (f.lat) params.set('lat', String(f.lat));
        if (f.lng) params.set('lng', String(f.lng));
        const searchStr = params.toString();
        return searchStr;
    }

    public static parseFiltersFromSearch = (search: string, defaultFilters: EmployeeProfileSearchFilters): EmployeeProfileSearchFilters => {
        const params = new URLSearchParams(search);

        const freeText = params.get('q') || '';
        const skills = FilterUtil.getArray('skills', params);
        const certificates = FilterUtil.getArray('certs', params);
        const communicationLanguages = FilterUtil.getArray('langs', params);
        const locationCountry = params.get('country') || null;
        const page = parseInt(params.get('page') || '1', 10);
        const limit = parseInt(params.get('limit') || String(defaultFilters.limit), 10);
        const skip = (page - 1) * limit;
        const startDate = params.get('startDate') ? new Date(params.get('startDate')!) : null;
        const endDate = params.get('endDate') ? new Date(params.get('endDate')!) : null;
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
            lat: FilterUtil.prepareNumberParam(params, 'lat'),
            lng: FilterUtil.prepareNumberParam(params, 'lng'),
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