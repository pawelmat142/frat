/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { EmployeeProfileRepo } from './EmployeeProfileRepo';
import { UserI } from '@shared/interfaces/UserI';
import { EmployeeProfileAvailabilityOptions, EmployeeProfileSearchForm, EmployeeProfileSearchResponse, EmployeeProfileStatuses } from '@shared/interfaces/EmployeeProfileI';
import { DateRangeUtil } from '@shared/utils/DateRangeUtil';
import { SelectQueryBuilder } from 'typeorm';
import { EmployeeProfileEntity } from 'employee/model/EmployeeProfileEntity';

@Injectable()
export class SearchEmployeeProfileService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly employeeProfileRepo: EmployeeProfileRepo,
    ) { }

    async searchEmployeeProfiles(user: UserI, query: EmployeeProfileSearchForm): Promise<EmployeeProfileSearchResponse> {
        const queryBuilder = this.employeeProfileRepo.getQueryBuilder()
            .leftJoinAndSelect('profile.availabilityDateRanges', 'ranges');

        // --- Fix: parse arrays from query string if needed ---
        const parseArray = (val: any): string[] | undefined => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string' && val.length > 0) return val.split(',');
            return undefined;
        };

        const skills = parseArray(query.skills);
        const certificates = parseArray(query.certificates);
        const communicationLanguages = parseArray(query.communicationLanguages);

        let hasFilter = false;

        // Base condition - only ACTIVE profiles
        queryBuilder.where('profile.status = :status', { status: EmployeeProfileStatuses.ACTIVE });

        this.addDateRangeFilter(queryBuilder, query, hasFilter);

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

        if (query.locationCountry) {
            queryBuilder.andWhere(':locationCountry = ANY (profile.location_countries)', { locationCountry: query.locationCountry });
            hasFilter = true;
        }

        // Free text fuzzy search
        if (query.freeText && query.freeText.trim().length > 1) {
            const freeText = `%${query.freeText.trim().toLowerCase()}%`;
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

        const count = await queryBuilder.getCount();

        // Sortowanie: start date rosnąco 
        queryBuilder
            .addSelect((subQuery) => {
                return subQuery
                    .select('MIN(lower(dr.date_range))', 'earliest')
                    .from('jh_employee_profile_availability_date_ranges', 'dr')
                    .where('dr.employee_profile_id = profile.employee_profile_id');
            }, 'earliest_date')
            .orderBy('earliest_date', 'ASC', 'NULLS LAST');


        // Obsługa paginacji
        if (query.skip) {
            queryBuilder.skip(query.skip);
        }
        if (query.limit) {
            queryBuilder.take(query.limit);
        }
        
        const results = await queryBuilder.getMany();
        return {
            profiles: results,
            count
        };
    }

    private addDateRangeFilter(queryBuilder: SelectQueryBuilder<EmployeeProfileEntity>, query: EmployeeProfileSearchForm, hasFilter: boolean) {
        // Date range filter - use already joined ranges
        if (query.dateRange?.start && query.dateRange?.end) {
            queryBuilder.andWhere(`(
                profile.availability_option = '${EmployeeProfileAvailabilityOptions.ANYTIME}'
                OR ranges.date_range @> daterange(:startDate, :endDate, '[]')
                OR (
                    profile.availability_option = '${EmployeeProfileAvailabilityOptions.FROM_DATE}'
                    AND lower(ranges.date_range) <= :startDate::date
                )
            )`, {
                startDate: DateRangeUtil.displayLocalDate(query.dateRange.start),
                endDate: DateRangeUtil.displayLocalDate(query.dateRange.end)
            });
            hasFilter = true;
        } else if (query.dateRange?.start) {
            // znajdz profile, gdzie start miesci sie w którymś z przedziałów tego profilu 
            queryBuilder.andWhere(`(
                profile.availability_option = '${EmployeeProfileAvailabilityOptions.ANYTIME}'
                OR ranges.date_range @> :startDate::date
                OR (
                    profile.availability_option = '${EmployeeProfileAvailabilityOptions.FROM_DATE}'
                    AND lower(ranges.date_range) <= :startDate::date
                )
            )`, {
                startDate: DateRangeUtil.displayLocalDate(query.dateRange.start)
            });
            hasFilter = true;
        }

    }
}
