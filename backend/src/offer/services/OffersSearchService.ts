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

}