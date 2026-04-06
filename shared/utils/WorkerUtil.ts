import { WorkerI, WorkerSearchFilters, WorkerSearchRequest, WorkerSearchSortOption } from "../interfaces/WorkerI";
import { ObjUtil } from "./ObjUtil";

export abstract class WorkerUtil {
    
    private static readonly START_DATE = 'startDate';
    private static readonly END_DATE = 'endDate';

    private static readonly LOCATION_COUNTRY = 'locationCountry';
    private static readonly LAT = 'lat';
    private static readonly LNG = 'lng';
    private static readonly RADIUS = 'radius';

    private static readonly CERTIFICATES = 'certificates';
    private static readonly CATEGORIES = 'categories';
    private static readonly COMMUNICATION_LANGUAGES = 'communicationLanguages';

    private static readonly PAGE = 'page';
    private static readonly LIMIT = 'limit';
    private static readonly SORT_BY = 'sortBy';

    private static getArray = (key: string, params: URLSearchParams): string[] => {
        const v = params.get(key)
        if (!v) return []
        return v.split(',').filter(Boolean)
    }

    public static filtersToRequest = (f: WorkerSearchFilters): WorkerSearchRequest => {
        return {
            startDate: f.startDate || undefined,
            endDate: f.endDate || undefined,
            locationCountry: f.locationCountry || null,
            lat: f.geocodedPosition?.lat,
            lng: f.geocodedPosition?.lng,
            positionRadiusKm: f.positionRadiusKm,
            certificates: f.certificates,
            categories: f.categories,
            communicationLanguages: f.communicationLanguages,
            skip: f.skip,
            limit: f.limit,
            sortBy: f.sortBy,
        };
    }

    public static prepareUrlParams = (f: WorkerSearchFilters, defaultFilters: WorkerSearchFilters): string => {
        const params = new URLSearchParams();
        if (f.startDate) {
            params.set(WorkerUtil.START_DATE, f.startDate);
            if (f.endDate) {
                params.set(WorkerUtil.END_DATE, f.endDate);
            }
        }
        if (f.locationCountry) {
            params.set(WorkerUtil.LOCATION_COUNTRY, f.locationCountry);
        }
        if (f.geocodedPosition?.lat) {
            params.set(WorkerUtil.LAT, String(f.geocodedPosition.lat));
        }
        if (f.geocodedPosition?.lng) {
            params.set(WorkerUtil.LNG, String(f.geocodedPosition.lng));
        }
        if (f.geocodedPosition?.lat && f.geocodedPosition.lng && f.positionRadiusKm) {
            params.set(WorkerUtil.RADIUS, String(f.positionRadiusKm));
        }

        if (f.certificates?.length) params.set(WorkerUtil.CERTIFICATES, f.certificates.join(','));
        if (f.categories?.length) params.set(WorkerUtil.CATEGORIES, f.categories.join(','));
        if (f.communicationLanguages?.length) params.set(WorkerUtil.COMMUNICATION_LANGUAGES, f.communicationLanguages.join(','));

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
        const startDate = params.get(WorkerUtil.START_DATE) || null;
        const endDate = params.get(WorkerUtil.END_DATE) || null;
        const locationCountry = params.get(WorkerUtil.LOCATION_COUNTRY) || null;
        const lat = params.get(WorkerUtil.LAT);
        const lng = params.get(WorkerUtil.LNG);
        const radius = params.get(WorkerUtil.RADIUS);

        const certificates = WorkerUtil.getArray(WorkerUtil.CERTIFICATES, params);
        const categories = WorkerUtil.getArray(WorkerUtil.CATEGORIES, params);
        const communicationLanguages = WorkerUtil.getArray(WorkerUtil.COMMUNICATION_LANGUAGES, params);

        const page = parseInt(params.get(WorkerUtil.PAGE) || '1', 10);
        const limit = parseInt(params.get(WorkerUtil.LIMIT) || String(defaultFilters.limit), 10);
        const skip = (page - 1) * limit;
        const sortBy = params.get(WorkerUtil.SORT_BY) as WorkerSearchSortOption || defaultFilters.sortBy;
        return {
            startDate,
            endDate,
            locationCountry,
            geocodedPosition: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : null,
            positionRadiusKm: radius ? parseFloat(radius) : undefined,
            certificates,
            categories,
            communicationLanguages,
            skip: skip < 0 ? 0 : skip,
            limit,
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
        if (f1.startDate !== f2.startDate) return false;
        if (f1.endDate !== f2.endDate) return false;
        if (f1.locationCountry !== f2.locationCountry) return false;
        if (ObjUtil.positionChanged(f1.geocodedPosition, f2.geocodedPosition)) return false;
        if (f1.positionRadiusKm !== f2.positionRadiusKm) return false;
        if (ObjUtil.arrayChanged(f1.certificates, f2.certificates)) return false;
        if (ObjUtil.arrayChanged(f1.categories, f2.categories)) return false;
        if (ObjUtil.arrayChanged(f1.communicationLanguages, f2.communicationLanguages)) return false;

        if (f1.skip !== f2.skip) return false;
        if (f1.limit !== f2.limit) return false;
        if (f1.sortBy !== f2.sortBy) return false;
        return true;
    }
}