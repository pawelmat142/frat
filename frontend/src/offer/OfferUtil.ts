import { OfferSearchFilters } from "@shared/interfaces/OfferI";
import { FilterUtil } from "global/FilterUtil";

export abstract class OfferUtil {

    public static prepareUrlParams = (f: OfferSearchFilters, defaultFilters: OfferSearchFilters) => {
        const params = new URLSearchParams();
        if (f.freeText) params.set('q', f.freeText);
        if (f.categories?.length) params.set('categories', f.categories.join(','));
        
        if (f.communicationLanguages?.length) params.set('communicationLanguages', f.communicationLanguages.join(','));
        if (f.locationCountries?.length) params.set('locationCountries', f.locationCountries.join(','));

        if (f.skills?.length) params.set('skills', f.skills.join(','));
        if (f.certificates?.length) params.set('certificates', f.certificates.join(','));
        
        if (f.monthlySalaryStart) params.set('monthlySalaryStart', String(f.monthlySalaryStart));
        if (f.hourlySalaryStart) params.set('hourlySalaryStart', String(f.hourlySalaryStart));

        const page = Math.floor(f.skip / f.limit) + 1;
        if (page > 1) params.set('page', String(page));
        if (f.limit !== defaultFilters.limit) params.set('limit', String(f.limit));
        const searchStr = params.toString();
        return searchStr;
    }

    public static parseFiltersFromSearch = (search: string, defaultFilters: OfferSearchFilters): OfferSearchFilters => {
        const params = new URLSearchParams(search);

        const freeText = params.get('q') || '';
        const categories = FilterUtil.getArray('categories', params);

        const communicationLanguages = FilterUtil.getArray('communicationLanguages', params);
        const locationCountries = FilterUtil.getArray('locationCountries', params);
        
        const skills = FilterUtil.getArray('skills', params);
        const certificates = FilterUtil.getArray('certificates', params);

        const monthlySalaryStart = FilterUtil.prepareNumberParam(params, 'monthlySalaryStart');
        const hourlySalaryStart = FilterUtil.prepareNumberParam(params, 'hourlySalaryStart');

        const page = parseInt(params.get('page') || '1', 10);
        const limit = parseInt(params.get('limit') || String(defaultFilters.limit), 10);
        const skip = (page - 1) * limit;

        return {
            freeText,
            categories,
            communicationLanguages,
            locationCountries,
            skills,
            certificates,
            monthlySalaryStart,
            hourlySalaryStart,
            skip: skip < 0 ? 0 : skip,
            limit,
        };
    }

}