import { Injectable, Logger } from "@nestjs/common";
import { OffersRepo } from "./OffersRepo";
import { OfferSearchFilters, OfferSearchResponse, OfferSearchSortOptions, OfferStatuses } from "@shared/interfaces/OfferI";
import { UserI } from "@shared/interfaces/UserI";
import { SearchUtil } from "global/utils/SearchUtil";
import { OfferEntity } from "offer/model/OfferEntity";
import { SelectQueryBuilder } from "typeorm";
import { AppConfig } from "@shared/AppConfig";
import { Position } from "@shared/interfaces/MapsInterfaces";
import { PositionUtil } from "@shared/utils/PositionUtil";
import { WORLDWIDE_LOCATION } from "@shared/interfaces/WorkerI";

@Injectable()
export class OffersSearchService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly offersRepo: OffersRepo,
    ) { }

    listAdminPanel(): Promise<OfferEntity[]> {
        return this.offersRepo.findAll()
    }

    async searchOffers(user: UserI, filters: OfferSearchFilters, viewerLocation?: Position, searchSessionId?: string): Promise<OfferSearchResponse> {
        const queryBuilder = this.offersRepo.getQueryBuilder()
        const normalizedViewerLocation = PositionUtil.normalizeViewerLocation(viewerLocation);

        let hasFilter = false;

        const categories = SearchUtil.parseArray(filters.categories);
        const communicationLanguages = SearchUtil.parseArray(filters.communicationLanguages);

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

        this.addPositionFilter(queryBuilder, filters, hasFilter);

        this.applySorting(queryBuilder, filters, normalizedViewerLocation);
        this.addPagination(queryBuilder, filters);

        const count = await queryBuilder.getCount();
        const results = await queryBuilder.getMany();
        return {
            offers: results,
            count
        };
    }

    private addPositionFilter(queryBuilder: SelectQueryBuilder<OfferEntity>, filters: OfferSearchFilters, hasFilter: boolean) {

        const locationCountries = SearchUtil.parseArray(filters.locationCountries);

        // Skip location filter if "worldwide" is selected
        if (locationCountries.includes(WORLDWIDE_LOCATION)) {
            return;
        }

        if (locationCountries?.length) {
            queryBuilder.andWhere('offer.location_country IN (:...countries)', { countries: locationCountries });
            hasFilter = true;
        }

    }

    private addPagination(queryBuilder: SelectQueryBuilder<OfferEntity>, filters: OfferSearchFilters) {
        if (filters.skip) {
            queryBuilder.skip(filters.skip);
        }
        if (filters.limit) {
            queryBuilder.take(filters.limit);
        }
    }

    private applySorting(queryBuilder: SelectQueryBuilder<OfferEntity>, filters: OfferSearchFilters, viewerLocation?: Position) {
        const sortBy = filters.sortBy || AppConfig.DEFAULT_OFFER_SEARCH_SORT_OPTION;
        switch (sortBy) {
            case OfferSearchSortOptions.DISTANCE_ASC:
                if (viewerLocation?.lat != null && viewerLocation?.lng != null) {
                    // Use ST_Distance with geography cast for accurate distance calculation in meters
                    // Order by distance ascending, then by favoritesCount descending for tie-breaking
                    queryBuilder.orderBy(
                        `ST_Distance(
                            offer.point,
                            ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
                        )`,
                        SearchUtil.ASC
                    );
                    queryBuilder.addOrderBy('offer.favoritesCount', SearchUtil.DESC);
                    queryBuilder.setParameter('lat', viewerLocation.lat);
                    queryBuilder.setParameter('lng', viewerLocation.lng);
                } else {
                    // Fallback to creation date if location is unavailable
                    queryBuilder.orderBy('offer.createdAt', SearchUtil.DESC);
                }
                break;

            case OfferSearchSortOptions.START_FROM_ASC:
                queryBuilder.orderBy('offer.startDate', SearchUtil.ASC);
                break;

            case OfferSearchSortOptions.START_FROM_DESC:
                queryBuilder.orderBy('offer.startDate', SearchUtil.DESC);
                break;

            case OfferSearchSortOptions.CREATED_AT_ASC:
                queryBuilder.orderBy('offer.createdAt', SearchUtil.ASC);
                break;

            case OfferSearchSortOptions.CREATED_AT_DESC:
                queryBuilder.orderBy('offer.createdAt', SearchUtil.DESC);
                break;

            default:
                // Default fallback
                queryBuilder.orderBy('offer.createdAt', SearchUtil.DESC);
                break;
        }
    }

}