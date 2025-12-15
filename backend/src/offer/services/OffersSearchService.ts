import { Injectable, Logger } from "@nestjs/common";
import { OffersRepo } from "./OffersRepo";
import { OfferSearchFilters, OfferSearchResponse, OfferStatuses } from "@shared/interfaces/OfferI";
import { UserI } from "@shared/interfaces/UserI";
import { SearchUtil } from "global/utils/SearchUtil";
import { OfferEntity } from "offer/model/OfferEntity";
import { SelectQueryBuilder } from "typeorm";

@Injectable()
export class OffersSearchService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly offersRepo: OffersRepo,
    ) { }

    listAdminPanel(): Promise<OfferEntity[]> {
        return this.offersRepo.findAll()
    }

    async searchOffers(user: UserI, filters: OfferSearchFilters): Promise<OfferSearchResponse> {
        const queryBuilder = this.offersRepo.getQueryBuilder()

        let hasFilter = false;

        const categories = SearchUtil.parseArray(filters.categories);
        const communicationLanguages = SearchUtil.parseArray(filters.communicationLanguages);
        const locationCountries = SearchUtil.parseArray(filters.locationCountries);
        const skills = SearchUtil.parseArray(filters.skills);
        const certificates = SearchUtil.parseArray(filters.certificates);

        // Base condition - only ACTIVE profiles
        queryBuilder.where('offer.status = :status', { status: OfferStatuses.ACTIVE });

        if (categories?.length) {
            queryBuilder.andWhere('offer.category IN (:...categories)', { categories });
            hasFilter = true;
        }
        if (communicationLanguages?.length) {
            queryBuilder.andWhere('offer.languages_required @> :languages', { languages: communicationLanguages });
            hasFilter = true;
        }
        if (locationCountries?.length) {
            queryBuilder.andWhere('offer.location_country IN (:...countries)', { countries: locationCountries });
            hasFilter = true;
        }
        if (certificates?.length) {
            queryBuilder.andWhere('offer.certificates_required @> :certificates', { certificates });
            hasFilter = true;
        }
        if (skills?.length) {
            queryBuilder.andWhere('offer.skills_required @> :skills', { skills });
            hasFilter = true;
        }

        this.addFuzzySearchFilter(queryBuilder, filters, hasFilter);
        this.addSalaryFilter(queryBuilder, filters, hasFilter);
        this.addPagination(queryBuilder, filters);

        const count = await queryBuilder.getCount();
        const results = await queryBuilder.getMany();
        return {
            offers: results,
            count
        };

    }

    private addPagination(queryBuilder: SelectQueryBuilder<OfferEntity>, filters: OfferSearchFilters) {
        if (filters.skip) {
            queryBuilder.skip(filters.skip);
        }
        if (filters.limit) {
            queryBuilder.take(filters.limit);
        }
    }

    private addSalaryFilter(queryBuilder: SelectQueryBuilder<OfferEntity>, filters: OfferSearchFilters, hasFilter: boolean) {
        if (!filters.currency) {
            return
        }
        hasFilter = true;
        queryBuilder.andWhere('(offer.currency = :currency OR offer.currency IS NULL)', { currency: filters.currency });

        if (filters.monthlySalaryStart) {
            queryBuilder.andWhere('(offer.monthly_salary_start IS NULL OR offer.monthly_salary_start >= :monthlySalaryStart)', { monthlySalaryStart: filters.monthlySalaryStart });
        }
        if (filters.hourlySalaryStart) {
            queryBuilder.andWhere('(offer.hourly_salary_start IS NULL OR offer.hourly_salary_start >= :hourlySalaryStart)', { hourlySalaryStart: filters.hourlySalaryStart });
        }
    }


    private addFuzzySearchFilter(queryBuilder: SelectQueryBuilder<OfferEntity>, filters: OfferSearchFilters, hasFilter: boolean) {
        // Free text fuzzy search
        if (filters.freeText && filters.freeText.trim().length > 1) {
            const freeText = `%${filters.freeText.trim().toLowerCase()}%`;
            queryBuilder.andWhere(`(
                    LOWER(offer.category) ILIKE :freeText OR
                    LOWER(offer.display_address) ILIKE :freeText OR
                    LOWER(offer.display_name) ILIKE :freeText OR
                    LOWER(offer.description) ILIKE :freeText OR
                    array_to_string(offer.skills_required, ',') ILIKE :freeText OR
                    array_to_string(offer.certificates_required, ',') ILIKE :freeText
                )`, { freeText });
            hasFilter = true;
        }
    }

}