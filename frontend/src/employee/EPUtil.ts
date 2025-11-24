import { EmployeeProfileI, EmployeeProfileSearchFilters } from "@shared/interfaces/EmployeeProfileI";

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
        const searchStr = params.toString();
        return searchStr;
    }

    public static parseFiltersFromSearch = (search: string, defaultFilters: EmployeeProfileSearchFilters): EmployeeProfileSearchFilters => {
        const params = new URLSearchParams(search);
        const getArray = (key: string): string[] => {
            const v = params.get(key);
            if (!v) return [];
            return v.split(',').filter(Boolean);
        };
        const freeText = params.get('q') || '';
        const skills = getArray('skills');
        const certificates = getArray('certs');
        const communicationLanguages = getArray('langs');
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