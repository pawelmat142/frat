import { PositionUtil } from "./PositionUtil";
import { FilterUtil } from "./FilterUtil";
import { DateUtil } from "./DateUtil";
import { OfferSearchFilters, OfferI, OfferForm, OfferFormSteps } from "../interfaces/OfferI";

export abstract class OfferUtil {
    private static readonly CATEGORIES = 'categories'
    private static readonly COMMUNICATION_LANGUAGES = 'communicationLanguages'
    private static readonly LOCATION_COUNTRIES = 'locationCountries'
    private static readonly PAGE = 'page';
    private static readonly LIMIT = 'limit';

    public static prepareUrlParams = (f: OfferSearchFilters, defaultFilters: OfferSearchFilters) => {
        const params = new URLSearchParams();
        if (f.categories?.length) params.set(OfferUtil.CATEGORIES, f.categories.join(','));
        if (f.communicationLanguages?.length) params.set(OfferUtil.COMMUNICATION_LANGUAGES, f.communicationLanguages.join(','));
        if (f.locationCountries?.length) params.set(OfferUtil.LOCATION_COUNTRIES, f.locationCountries.join(','));

        const page = Math.floor(f.skip / f.limit) + 1;
        if (page > 1) params.set(OfferUtil.PAGE, String(page));
        if (f.limit !== defaultFilters.limit) params.set(OfferUtil.LIMIT, String(f.limit));
        const searchStr = params.toString();
        return searchStr;
    }

    public static parseFiltersFromSearch = (search: string, defaultFilters: OfferSearchFilters): OfferSearchFilters => {
        const params = new URLSearchParams(search);

        const categories = FilterUtil.getArray(OfferUtil.CATEGORIES, params);
        const communicationLanguages = FilterUtil.getArray(OfferUtil.COMMUNICATION_LANGUAGES, params);
        const locationCountries = FilterUtil.getArray(OfferUtil.LOCATION_COUNTRIES, params);

        const page = parseInt(params.get(OfferUtil.PAGE) || '1', 10);
        const limit = parseInt(params.get('limit') || String(defaultFilters.limit), 10);
        const skip = (page - 1) * limit;

        return {
            categories,
            communicationLanguages,
            locationCountries,
            skip: skip < 0 ? 0 : skip,
            limit,
        };
    }
    
    public static convertToForm(offer: OfferI): OfferForm {

        return {
            currentStep: OfferFormSteps.STEP_ONE,
            STEP_ONE: {
                category: offer.category ?? null,
                startDate: DateUtil.toLocalDateString(offer.startDate) ?? null,
                communicationLanguages: offer.languagesRequired ?? [],
                phoneNumber: offer.phoneNumber ?? null,
            },
            STEP_TWO: {
                locationCountry: offer.locationCountry ?? null,
                geocodedPosition: offer.point ? PositionUtil.fromGeoPoint(offer.point) : null,
            },
            STEP_THREE: {
                displayName: offer.displayName ?? null,
                currency: offer.currency ?? null,
                salary: offer.salary ?? null,
                description: offer.description ?? null,
            },
        };
    }

}