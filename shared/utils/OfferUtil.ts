import { DateRange, Position } from "@shared/interfaces/EmployeeProfileI";
import { Currency, OfferForm, OfferFormSteps, OfferI, OfferSearchFilters } from "@shared/interfaces/OfferI";
import { FilterUtil } from "@shared/utils/FilterUtil";
import { PositionUtil } from "./PositionUtil";

export abstract class OfferUtil {

    private static readonly FREE_TEXT = 'q';
    private static readonly CATEGORIES = 'categories'
    private static readonly COMMUNICATION_LANGUAGES = 'communicationLanguages'
    private static readonly LOCATION_COUNTRIES = 'locationCountries'
    private static readonly SKILLS = 'skills'
    private static readonly CERTIFICATES = 'certificates'
    private static readonly CURRENCY = 'currency'
    private static readonly MONTHLY_SALARY_START = 'monthlySalaryStart'
    private static readonly HOURLY_SALARY_START = 'hourlySalaryStart'
    private static readonly PAGE = 'page';
    private static readonly LIMIT = 'limit';

    public static prepareUrlParams = (f: OfferSearchFilters, defaultFilters: OfferSearchFilters) => {
        const params = new URLSearchParams();
        if (f.freeText) params.set(OfferUtil.FREE_TEXT, f.freeText);
        if (f.categories?.length) params.set(OfferUtil.CATEGORIES, f.categories.join(','));
        
        if (f.communicationLanguages?.length) params.set(OfferUtil.COMMUNICATION_LANGUAGES, f.communicationLanguages.join(','));
        if (f.locationCountries?.length) params.set(OfferUtil.LOCATION_COUNTRIES, f.locationCountries.join(','));

        if (f.skills?.length) params.set(OfferUtil.SKILLS, f.skills.join(','));
        if (f.certificates?.length) params.set(OfferUtil.CERTIFICATES, f.certificates.join(','));
        
        if (f.currency) params.set(OfferUtil.CURRENCY, f.currency);
        if (f.monthlySalaryStart) params.set(OfferUtil.MONTHLY_SALARY_START, String(f.monthlySalaryStart));
        if (f.hourlySalaryStart) params.set(OfferUtil.HOURLY_SALARY_START, String(f.hourlySalaryStart));

        const page = Math.floor(f.skip / f.limit) + 1;
        if (page > 1) params.set(OfferUtil.PAGE, String(page));
        if (f.limit !== defaultFilters.limit) params.set(OfferUtil.LIMIT, String(f.limit));
        const searchStr = params.toString();
        return searchStr;
    }

    public static parseFiltersFromSearch = (search: string, defaultFilters: OfferSearchFilters): OfferSearchFilters => {
        const params = new URLSearchParams(search);

        const freeText = params.get(OfferUtil.FREE_TEXT) || undefined;
        const categories = FilterUtil.getArray(OfferUtil.CATEGORIES, params);

        const communicationLanguages = FilterUtil.getArray(OfferUtil.COMMUNICATION_LANGUAGES, params);
        const locationCountries = FilterUtil.getArray(OfferUtil.LOCATION_COUNTRIES, params);
        
        const skills = FilterUtil.getArray(OfferUtil.SKILLS, params);
        const certificates = FilterUtil.getArray(OfferUtil.CERTIFICATES, params);

        const currency = params.get(OfferUtil.CURRENCY) as Currency | null
        const monthlySalaryStart = FilterUtil.prepareNumberParam(params, OfferUtil.MONTHLY_SALARY_START);
        const hourlySalaryStart = FilterUtil.prepareNumberParam(params, OfferUtil.HOURLY_SALARY_START);

        const page = parseInt(params.get(OfferUtil.PAGE) || '1', 10);
        const limit = parseInt(params.get('limit') || String(defaultFilters.limit), 10);
        const skip = (page - 1) * limit;

        return {
            freeText,
            categories,
            communicationLanguages,
            locationCountries,
            skills,
            certificates,
            currency: currency,
            monthlySalaryStart,
            hourlySalaryStart,
            skip: skip < 0 ? 0 : skip,
            limit,
        };
    }

        public static convertToForm(offer: OfferI): OfferForm {
        const position: Position | null = offer.point ? PositionUtil.fromGeoPoint(offer.point, offer.displayAddress) : null;
        const dateRange: DateRange | null = {
            start: offer.startDate ?? null,
            end: offer.endDate ?? null,
        };

        return {
            currentStep: OfferFormSteps.STEP_ONE,
            STEP_ONE: {
                category: offer.category ?? null,
                locationCountry: offer.locationCountry ?? null,
                displayAddress: offer.displayAddress ?? null,
                position: position,
                dateRange: dateRange,
                availableSlots: offer.availableSlots ?? null,
            },
            STEP_TWO: {
                skillsRequired: offer.skillsRequired,
                skillsNiceToHave: offer.skillsNiceToHave,
                certificatesRequired: offer.certificatesRequired,
                certificatesNiceToHave: offer.certificatesNiceToHave,
                languagesRequired: offer.languagesRequired,
                languagesNiceToHave: offer.languagesNiceToHave,
            },
            STEP_THREE: {
                monthlySalaryStart: offer.monthlySalaryStart ? String(offer.monthlySalaryStart) : undefined,
                monthlySalaryEnd: offer.monthlySalaryEnd ? String(offer.monthlySalaryEnd) : undefined,
                hourlySalaryStart: offer.hourlySalaryStart ? String(offer.hourlySalaryStart) : undefined,
                hourlySalaryEnd: offer.hourlySalaryEnd ? String(offer.hourlySalaryEnd) : undefined,
                currency: offer.currency ?? null,
            },
            STEP_FOUR: {
                displayName: offer.displayName ?? null,
                description: offer.description ?? null,
            }
        };
    }

}