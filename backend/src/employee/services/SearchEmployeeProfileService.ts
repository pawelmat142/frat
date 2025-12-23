/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { EmployeeProfileRepo } from './EmployeeProfileRepo';
import { UserI } from '@shared/interfaces/UserI';
import { EmmployeeProfileSearchSortOptions, EmployeeProfileAvailabilityOptions, EmployeeProfileLocationOptions, EmployeeProfileSearchFilters, EmployeeProfileSearchResponse, EmployeeProfileStatuses, PROFILES_INITIAL_SEARCH_LIMIT } from '@shared/interfaces/EmployeeProfileI';
import { DateRangeUtil } from '@shared/utils/DateRangeUtil';
import { SelectQueryBuilder } from 'typeorm';
import { EmployeeProfileEntity } from 'employee/model/EmployeeProfileEntity';
import { SearchUtil } from 'global/utils/SearchUtil';

@Injectable()
export class SearchEmployeeProfileService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly employeeProfileRepo: EmployeeProfileRepo,
    ) { }

    async searchEmployeeProfiles(user: UserI, filters: EmployeeProfileSearchFilters): Promise<EmployeeProfileSearchResponse> {
        // Step 1: Build base query for filtering (without eagerly loading relations to avoid row multiplication)
        const baseQueryBuilder = this.employeeProfileRepo.getQueryBuilder()
            .leftJoin('profile.availabilityDateRanges', 'ranges');

        const skills = SearchUtil.parseArray(filters.skills);
        const certificates = SearchUtil.parseArray(filters.certificates);
        const communicationLanguages = SearchUtil.parseArray(filters.communicationLanguages);

        let hasFilter = false;

        // Base condition - only ACTIVE profiles
        baseQueryBuilder.where('profile.status = :status', { status: EmployeeProfileStatuses.ACTIVE });

        if (communicationLanguages?.length) {
            baseQueryBuilder.andWhere('profile.communication_languages @> :languages', { languages: communicationLanguages });
            hasFilter = true;
        }
        if (certificates?.length) {
            baseQueryBuilder.andWhere('profile.certificates @> :certificates', { certificates });
            hasFilter = true;
        }
        if (skills?.length) {
            baseQueryBuilder.andWhere('profile.skills @> :skills', { skills });
            hasFilter = true;
        }

        this.addFuzzySearchFilter(baseQueryBuilder, filters, hasFilter);
        this.addDateRangeFilter(baseQueryBuilder, filters, hasFilter);
        this.addPositionFilter(baseQueryBuilder, filters, hasFilter);

        const count: number = await this.getCount(baseQueryBuilder);

        if (!count) {
            return { profiles: [], count };
        }

        // Step 3: Get paginated profile IDs (distinct, with sorting)
        // Using subquery approach to avoid DISTINCT + ORDER BY column mismatch
        const idsQueryBuilder = baseQueryBuilder.clone()
            .select('profile.employee_profile_id', 'id')
            .groupBy('profile.employee_profile_id');

        this.addSortingForIds(idsQueryBuilder, filters);
        this.addPagination(idsQueryBuilder, filters);

        const idsResult = await idsQueryBuilder.getRawMany();
        const profileIds = idsResult.map(row => row.id);

        // Step 4: Load full profiles with relations using the IDs
        const resultsQueryBuilder = this.employeeProfileRepo.getQueryBuilder()
            .leftJoinAndSelect('profile.availabilityDateRanges', 'ranges')
            .whereInIds(profileIds);

        this.addSortingById(resultsQueryBuilder, profileIds);

        const results = await resultsQueryBuilder.getMany();

        return {
            profiles: results,
            count
        };
    }

    // TODO sortowanie po popularnosci
    // TODO sortowanie po dystansie

    private getCount(queryBuilder: SelectQueryBuilder<EmployeeProfileEntity>): Promise<number> {
        const countQuery = queryBuilder.clone()
            .select('profile.employee_profile_id')
            .distinct(true)
            .orderBy();
        return countQuery.getCount();
    }
    /** Sorting for ID selection query (raw SQL) */
    private addSortingForIds(queryBuilder: SelectQueryBuilder<EmployeeProfileEntity>, filters: EmployeeProfileSearchFilters) {
        switch (filters.sortBy) {
            case EmmployeeProfileSearchSortOptions.START_FROM_ASC:
                queryBuilder
                    .addSelect('MIN(lower(ranges.date_range))', 'earliest_date')
                    .orderBy('earliest_date', 'ASC', 'NULLS LAST');
                break;

            case EmmployeeProfileSearchSortOptions.START_FROM_DESC:
                queryBuilder
                    .addSelect('MIN(lower(ranges.date_range))', 'earliest_date')
                    .orderBy('earliest_date', 'DESC', 'NULLS FIRST');
                break;

            case EmmployeeProfileSearchSortOptions.CREATED_AT_DESC:
                queryBuilder
                    .addSelect('MAX(profile.created_at)', 'sort_created_at')
                    .orderBy('sort_created_at', SearchUtil.DESC);
                break;
            case EmmployeeProfileSearchSortOptions.CREATED_AT_ASC:
                queryBuilder
                    .addSelect('MIN(profile.created_at)', 'sort_created_at')
                    .orderBy('sort_created_at', SearchUtil.ASC);
                break;
        }
    }

    /** Preserve order from paginated IDs query using CASE expression */
    private addSortingById(queryBuilder: SelectQueryBuilder<EmployeeProfileEntity>, profileIds: number[]) {
        if (profileIds.length === 0) return;

        // Preserve original order using CASE WHEN
        const orderCase = profileIds
            .map((id, index) => `WHEN profile.employee_profile_id = ${id} THEN ${index}`)
            .join(' ');

        queryBuilder.orderBy(`CASE ${orderCase} END`, 'ASC');
    }

    private addPagination(queryBuilder: SelectQueryBuilder<EmployeeProfileEntity>, filters: EmployeeProfileSearchFilters) {
        const skip = Number(filters.skip) || 0;
        const limit = Number(filters.limit) || PROFILES_INITIAL_SEARCH_LIMIT;
        queryBuilder.offset(skip).limit(limit);
    }

    private addPositionFilter(queryBuilder: SelectQueryBuilder<EmployeeProfileEntity>, filters: EmployeeProfileSearchFilters, hasFilter: boolean) {
        const locationCountries = SearchUtil.parseArray(filters.locationCountry);

        if (!locationCountries?.length) {
            return;
        }
        hasFilter = true;
        // Matching logic: ANY overlap between provided list and profile.location_countries OR profile is ALL_EUROPE
        // Uses Postgres array overlap operator '&&'.
        queryBuilder.andWhere(`(
            profile.location_option = :allEuropeOption
            OR profile.location_countries && :locationCountries
        )`, {
            locationCountries,
            allEuropeOption: EmployeeProfileLocationOptions.ALL_EUROPE
        });
    }

    private addDateRangeFilter(queryBuilder: SelectQueryBuilder<EmployeeProfileEntity>, filters: EmployeeProfileSearchFilters, hasFilter: boolean) {
        // Date range filter - use already joined ranges
        if (filters.startDate && filters.endDate) {
            queryBuilder.andWhere(`(
                profile.availability_option = '${EmployeeProfileAvailabilityOptions.ANYTIME}'
                OR ranges.date_range @> daterange(:startDate, :endDate, '[]')
                OR (
                    profile.availability_option = '${EmployeeProfileAvailabilityOptions.FROM_DATE}'
                    AND lower(ranges.date_range) <= :startDate::date
                )
            )`, {
                startDate: DateRangeUtil.displayLocalDate(filters.startDate),
                endDate: DateRangeUtil.displayLocalDate(filters.endDate)
            });
            hasFilter = true;
        } else if (filters.startDate) {
            // znajdz profile, gdzie start miesci sie w którymś z przedziałów tego profilu 
            queryBuilder.andWhere(`(
                profile.availability_option = '${EmployeeProfileAvailabilityOptions.ANYTIME}'
                OR ranges.date_range @> :startDate::date
                OR (
                    profile.availability_option = '${EmployeeProfileAvailabilityOptions.FROM_DATE}'
                    AND lower(ranges.date_range) <= :startDate::date
                )
            )`, {
                startDate: DateRangeUtil.displayLocalDate(filters.startDate)
            });
            hasFilter = true;
        }
    }

    private addFuzzySearchFilter(queryBuilder: SelectQueryBuilder<EmployeeProfileEntity>, filters: EmployeeProfileSearchFilters, hasFilter: boolean) {
        // Free text fuzzy search
        if (filters.freeText && filters.freeText.trim().length > 1) {
            const freeText = `%${filters.freeText.trim().toLowerCase()}%`;
            queryBuilder.andWhere(`(
                LOWER(profile.display_name) ILIKE :freeText OR
                LOWER(profile.email) ILIKE :freeText OR
                LOWER(profile.first_name) ILIKE :freeText OR
                LOWER(profile.last_name) ILIKE :freeText OR
                LOWER(profile.full_address) ILIKE :freeText OR
                array_to_string(profile.skills, ',') ILIKE :freeText OR
                array_to_string(profile.certificates, ',') ILIKE :freeText
            )`, { freeText });
            hasFilter = true;
        }
    }

}