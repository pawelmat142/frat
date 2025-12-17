/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { EmployeeProfileRepo } from './EmployeeProfileRepo';
import { UserI } from '@shared/interfaces/UserI';
import { EmployeeProfileAvailabilityOptions, EmployeeProfileLocationOptions, EmployeeProfileSearchFilters, EmployeeProfileSearchResponse, EmployeeProfileStatuses } from '@shared/interfaces/EmployeeProfileI';
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
        const queryBuilder = this.employeeProfileRepo.getQueryBuilder()
            .leftJoinAndSelect('profile.availabilityDateRanges', 'ranges');

        const skills = SearchUtil.parseArray(filters.skills);
        const certificates = SearchUtil.parseArray(filters.certificates);
        const communicationLanguages = SearchUtil.parseArray(filters.communicationLanguages);

        // Location filter (countries overlap + global ALL_EUROPE option)
        let hasFilter = false;

        // Base condition - only ACTIVE profiles
        queryBuilder.where('profile.status = :status', { status: EmployeeProfileStatuses.ACTIVE });

        this.addDateRangeFilter(queryBuilder, filters, hasFilter);
        this.addPositionFilter(queryBuilder, filters, hasFilter);

        if (communicationLanguages?.length) {
            queryBuilder.andWhere('profile.communication_languages @> :languages', { languages: communicationLanguages });
            hasFilter = true;
        }
        if (certificates?.length) {
            queryBuilder.andWhere('profile.certificates @> :certificates', { certificates });
            hasFilter = true;
        }
        if (skills?.length) {
            queryBuilder.andWhere('profile.skills @> :skills', { skills });
            hasFilter = true;
        }

        this.addFuzzySearchFilter(queryBuilder, filters, hasFilter);

        // Sortowanie: start date rosnąco 
        queryBuilder
            .addSelect((subQuery) => {
                return subQuery
                    .select('MIN(lower(dr.date_range))', 'earliest')
                    .from('jh_employee_profile_availability_date_ranges', 'dr')
                    .where('dr.employee_profile_id = profile.employee_profile_id');
            }, 'earliest_date')
            .orderBy('earliest_date', 'ASC', 'NULLS LAST');


        const countQuery = queryBuilder.clone()
            .select('profile.employee_profile_id')
            .distinct(true);

        const count = await countQuery.getCount();

        this.addPagination(queryBuilder, filters);

        const results = await queryBuilder.getMany();
        return {
            profiles: results,
            count
        };
    }

    private addPagination(queryBuilder: SelectQueryBuilder<EmployeeProfileEntity>, filters: EmployeeProfileSearchFilters) {
        if (filters.skip) {
            queryBuilder.skip(filters.skip);
        }
        if (filters.limit) {
            queryBuilder.take(filters.limit);
        }
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
                array_to_string(profile.skills, ',') ILIKE :freeText OR
                array_to_string(profile.certificates, ',') ILIKE :freeText
            )`, { freeText });
            hasFilter = true;
        }
    }

}
