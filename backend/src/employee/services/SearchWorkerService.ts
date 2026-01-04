/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { WorkerRepo } from './WorkerRepo';
import { UserI } from '@shared/interfaces/UserI';
import { WorkerSearchSortOptions, WorkerAvailabilityOptions, WorkerSearchFilters, WorkerSearchResponse, WorkerStatuses, PROFILES_INITIAL_SEARCH_LIMIT, WorkerLocationOptions, WorkerFormRangesOptions } from '@shared/interfaces/WorkerProfileI';
import { SelectQueryBuilder } from 'typeorm';
import { WorkerEntity } from 'employee/model/WorkerEntity';
import { SearchUtil } from 'global/utils/SearchUtil';

@Injectable()
export class SearchWorkersService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly workerRepo: WorkerRepo,
    ) { }

    async searchWorkers(user: UserI, filters: WorkerSearchFilters): Promise<WorkerSearchResponse> {
        // Step 1: Build base query for filtering (without eagerly loading relations to avoid row multiplication)
        const baseQueryBuilder = this.workerRepo.getQueryBuilder()
            .leftJoin('profile.availabilityDateRanges', 'ranges');

        let hasFilter = false;

        this.addBasicFilters(baseQueryBuilder, filters, hasFilter);
        // this.addFuzzySearchFilter(baseQueryBuilder, filters, hasFilter);
        this.addDateRangeFilter(baseQueryBuilder, filters, hasFilter);
        this.addPositionFilter(baseQueryBuilder, filters, hasFilter);

        const count: number = await this.getCount(baseQueryBuilder);

        if (!count) {
            return { profiles: [], count };
        }

        // Step 3: Get paginated profile IDs (distinct, with sorting)
        // Using subquery approach to avoid DISTINCT + ORDER BY column mismatch
        const idsQueryBuilder = baseQueryBuilder.clone()
            .select('profile.worker_id', 'id')
            .groupBy('profile.worker_id');

        this.addSortingForIds(idsQueryBuilder, filters);
        this.addPagination(idsQueryBuilder, filters);

        const idsResult = await idsQueryBuilder.getRawMany();
        const profileIds = idsResult.map(row => row.id);

        // Step 4: Load full profiles with relations using the IDs
        const resultsQueryBuilder = this.workerRepo.getQueryBuilder()
            .leftJoinAndSelect('profile.availabilityDateRanges', 'ranges')
            .whereInIds(profileIds);

        this.addSortingById(resultsQueryBuilder, profileIds);

        const results = await resultsQueryBuilder.getMany();

        return {
            profiles: results,
            count
        };
    }

    
    private addBasicFilters(baseQueryBuilder: SelectQueryBuilder<WorkerEntity>, filters: WorkerSearchFilters, hasFilter: boolean) {
        const experience = SearchUtil.parseArray(filters.experience);
        const certificates = SearchUtil.parseArray(filters.certificates);
        const communicationLanguages = SearchUtil.parseArray(filters.communicationLanguages);
        // Base condition - only ACTIVE profiles
        baseQueryBuilder.where('profile.status = :status', { status: WorkerStatuses.ACTIVE });

        if (communicationLanguages?.length) {
            baseQueryBuilder.andWhere('profile.communication_languages @> :languages', { languages: communicationLanguages });
            hasFilter = true;
        }
        if (certificates?.length) {
            baseQueryBuilder.andWhere('profile.certificates @> :certificates', { certificates });
            hasFilter = true;
        }
        if (experience?.length) {
            baseQueryBuilder.andWhere('profile.experience @> :experience', { experience });
            hasFilter = true;
        }
    }
    
    private addDateRangeFilter(baseQueryBuilder: SelectQueryBuilder<WorkerEntity>, filters: WorkerSearchFilters, hasFilter: boolean) {
        // Date range filter - use already joined ranges
        // filters.startDate and endDate are strings in YYYY-MM-DD format
        if (filters.startDate && filters.endDate) {
            baseQueryBuilder.andWhere(`(
                profile.availability_option = '${WorkerAvailabilityOptions.ANYTIME}'
                OR (
                    profile.ranges_option = '${WorkerFormRangesOptions.AVAILABLE_ON}'
                    AND ranges.date_range @> daterange(:startDate, :endDate, '[]')
                )
                OR (
                    profile.ranges_option = '${WorkerFormRangesOptions.NOT_AVAILABLE_ON}'
                    AND NOT EXISTS (
                        SELECT 1 FROM jh_workers_date_ranges r2
                        WHERE r2.worker_id = profile.worker_id
                        AND r2.date_range && daterange(:startDate, :endDate, '[]')
                    )
                )
                OR (
                    profile.availability_option = '${WorkerAvailabilityOptions.FROM_DATE}'
                    AND profile.start_date <= :startDate::date
                )
            )`, {
                startDate: filters.startDate,
                endDate: filters.endDate
            });
            hasFilter = true;
        } else if (filters.startDate) {
            // Only startDate provided - compare with worker's start_date only
            baseQueryBuilder.andWhere(`(
                profile.start_date IS NULL
                OR profile.start_date <= :startDate::date
            )`, {
                startDate: filters.startDate
            });
            hasFilter = true;
        }
    }

    // TODO sortowanie po start date jakoś koślawo działa
    private addSortingForIds(idsQueryBuilder: SelectQueryBuilder<WorkerEntity>, filters: WorkerSearchFilters) {
        switch (filters.sortBy) {
            case WorkerSearchSortOptions.START_FROM_ASC:
                idsQueryBuilder
                    .addSelect('MIN(lower(ranges.date_range))', 'earliest_date')
                    .addOrderBy('earliest_date', SearchUtil.ASC, 'NULLS LAST');
                break;

            case WorkerSearchSortOptions.START_FROM_DESC:
                idsQueryBuilder
                    .addSelect('MIN(lower(ranges.date_range))', 'earliest_date')
                    .addOrderBy('earliest_date', SearchUtil.DESC, 'NULLS FIRST');
                break;

            case WorkerSearchSortOptions.CREATED_AT_DESC:
                idsQueryBuilder
                    .addSelect('MAX(profile.created_at)', 'sort_created_at')
                    .addOrderBy('sort_created_at', SearchUtil.DESC);
                break;
            case WorkerSearchSortOptions.CREATED_AT_ASC:
                idsQueryBuilder
                    .addSelect('MIN(profile.created_at)', 'sort_created_at')
                    .addOrderBy('sort_created_at', SearchUtil.ASC);
                break;

            // case EmmployeeProfileSearchSortOptions.DISTANCE_ASC:
            //     if (filters.position) {
            //         idsQueryBuilder
            //             .addSelect(`
            //                 ST_Distance(
            //                     profile.point::geography,
            //                     ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography
            //                 )
            //             `, 'distance_meters')
            //             .addOrderBy('distance_meters', SearchUtil.ASC, 'NULLS FIRST')
            //             .setParameter('lng', filters.position.lng)
            //             .setParameter('lat', filters.position.lat);
            //     }
            //     break;
        }

        // add views count sorting
        idsQueryBuilder
            .addOrderBy('array_length(profile.views, 1)', SearchUtil.DESC, 'NULLS LAST');
    }

    /** Preserve order from paginated IDs query using CASE expression */
    private addSortingById(queryBuilder: SelectQueryBuilder<WorkerEntity>, profileIds: number[]) {
        if (profileIds.length === 0) return;

        // Preserve original order using CASE WHEN
        const orderCase = profileIds
            .map((id, index) => `WHEN profile.worker_id = ${id} THEN ${index}`)
            .join(' ');

        queryBuilder.orderBy(`CASE ${orderCase} END`, 'ASC');
    }

    
    private getCount(queryBuilder: SelectQueryBuilder<WorkerEntity>): Promise<number> {
        const countQuery = queryBuilder.clone()
            .select('profile.worker_id')
            .distinct(true)
            .orderBy();
        return countQuery.getCount();
    }

    private addPagination(queryBuilder: SelectQueryBuilder<WorkerEntity>, filters: WorkerSearchFilters) {
        const skip = Number(filters.skip) || 0;
        const limit = Number(filters.limit) || PROFILES_INITIAL_SEARCH_LIMIT;
        queryBuilder.offset(skip).limit(limit);
    }

    private addPositionFilter(baseQueryBuilder: SelectQueryBuilder<WorkerEntity>, filters: WorkerSearchFilters, hasFilter: boolean) {
        // Location country filter: ALL_EUROPE or country in locationCountries array
        // TODO fuzzy po full adress dodać
        if (filters.locationCountry) {
            baseQueryBuilder.andWhere(`(
                profile.location_option = '${WorkerLocationOptions.ALL_EUROPE}'
                OR LOWER(:locationCountry) = ANY(profile.location_countries)
            )`, {
                locationCountry: filters.locationCountry.toLowerCase()
            });
            hasFilter = true;
        }
    }


    private addFuzzySearchFilter(queryBuilder: SelectQueryBuilder<WorkerEntity>, filters: WorkerSearchFilters, hasFilter: boolean) {
        // Free text fuzzy search
        if (filters.freeText && filters.freeText.trim().length > 1) {
            const freeText = `%${filters.freeText.trim().toLowerCase()}%`;
            queryBuilder.andWhere(`(
                LOWER(profile.full_address) ILIKE :freeText
            )`, { freeText });
            hasFilter = true;
        }
    }


}