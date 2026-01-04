import { WorkerI, WorkerSearchFilters, WorkerSearchSortOption } from "../interfaces/WorkerProfileI";
import { ObjUtil } from "./ObjUtil";

export abstract class WorkerUtil {

    private static readonly FREE_TEXT = 'q';
    private static readonly SKILLS = 'skills';
    private static readonly CERTIFICATES = 'certs';
    private static readonly COMMUNICATION_LANGUAGES = 'langs';
    private static readonly LOCATION_COUNTRY = 'country';
    private static readonly START_DATE = 'startDate';
    private static readonly END_DATE = 'endDate';

    private static readonly PAGE = 'page';
    private static readonly LIMIT = 'limit';
    private static readonly SORT_BY = 'sortBy';

    private static getArray = (key: string, params: URLSearchParams): string[] => {
        const v = params.get(key)
        if (!v) return []
        return v.split(',').filter(Boolean)
    }



    public static prepareUrlParams = (f: WorkerSearchFilters, defaultFilters: WorkerSearchFilters): string => {
        const params = new URLSearchParams();
        if (f.freeText) params.set(WorkerUtil.FREE_TEXT, f.freeText);
        if (f.experience?.length) params.set(WorkerUtil.SKILLS, f.experience.join(','));
        if (f.certificates?.length) params.set(WorkerUtil.CERTIFICATES, f.certificates.join(','));
        if (f.communicationLanguages?.length) params.set(WorkerUtil.COMMUNICATION_LANGUAGES, f.communicationLanguages.join(','));
        if (f.locationCountry) params.set(WorkerUtil.LOCATION_COUNTRY, f.locationCountry);
        if (f.startDate) {
            params.set(WorkerUtil.START_DATE, f.startDate);
            if (f.endDate) {
                params.set(WorkerUtil.END_DATE, f.endDate);
            }
        }
        const skip = f.skip ?? 0;
        const limit = f.limit ?? defaultFilters.limit ?? 12;
        const page = Math.floor(skip / limit) + 1;
        if (page > 1) params.set(WorkerUtil.PAGE, String(page));
        if (f.limit !== defaultFilters.limit) params.set(WorkerUtil.LIMIT, String(f.limit));
        if (f.sortBy) params.set(WorkerUtil.SORT_BY, f.sortBy);
        const searchStr = params.toString();
        return searchStr;
    }

    public static parseFiltersFromSearch = (search: string, defaultFilters: WorkerSearchFilters): WorkerSearchFilters => {
        const params = new URLSearchParams(search);

        const freeText = params.get(WorkerUtil.FREE_TEXT) || undefined;
        const skills = WorkerUtil.getArray(WorkerUtil.SKILLS, params);
        const certificates = WorkerUtil.getArray(WorkerUtil.CERTIFICATES, params);
        const communicationLanguages = WorkerUtil.getArray(WorkerUtil.COMMUNICATION_LANGUAGES, params);
        const locationCountry = params.get(WorkerUtil.LOCATION_COUNTRY) || null;
        const page = parseInt(params.get(WorkerUtil.PAGE) || '1', 10);
        const limit = parseInt(params.get(WorkerUtil.LIMIT) || String(defaultFilters.limit), 10);
        const skip = (page - 1) * limit;
        const startDate = params.get(WorkerUtil.START_DATE) || null;
        const endDate = params.get(WorkerUtil.END_DATE) || null;
        const sortBy = params.get(WorkerUtil.SORT_BY) as WorkerSearchSortOption || defaultFilters.sortBy;
        return {
            freeText,
            experience: skills,
            certificates,
            communicationLanguages,
            locationCountry,
            skip: skip < 0 ? 0 : skip,
            limit,
            startDate,
            endDate,
            sortBy,
        };
    }

    public static displayName = (worker: WorkerI): string => {
        if (worker.displayName) {
            return worker.displayName
        }
        if (worker.fullName) {
            return worker.fullName
        }
        throw new Error('Worker has no displayName or fullName');
    }

    public static filtersEquals = (f1: WorkerSearchFilters, f2: WorkerSearchFilters): boolean => {
        if (f1.freeText !== f2.freeText) return false;
        if (f1.locationCountry !== f2.locationCountry) return false;
        if (f1.startDate !== f2.startDate) return false;
        if (f1.endDate !== f2.endDate) return false;
        if (ObjUtil.arrayChanged(f1.experience, f2.experience)) return false;
        if (ObjUtil.arrayChanged(f1.certificates, f2.certificates)) return false;
        if (ObjUtil.arrayChanged(f1.communicationLanguages, f2.communicationLanguages)) return false;
        if (f1.skip !== f2.skip) return false;
        if (f1.limit !== f2.limit) return false;
        if (f1.sortBy !== f2.sortBy) return false;
        return true;
    }
}