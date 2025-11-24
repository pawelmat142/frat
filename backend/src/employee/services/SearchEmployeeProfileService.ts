/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { EmployeeProfileRepo } from './EmployeeProfileRepo';
import { UserI } from '@shared/interfaces/UserI';
import { EmployeeProfileAvailabilityOptions, EmployeeProfileSearchFilters, EmployeeProfileSearchResponse, EmployeeProfileStatuses } from '@shared/interfaces/EmployeeProfileI';
import { DateRangeUtil } from '@shared/utils/DateRangeUtil';
import { SelectQueryBuilder } from 'typeorm';
import { EmployeeProfileEntity } from 'employee/model/EmployeeProfileEntity';

@Injectable()
export class SearchEmployeeProfileService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly employeeProfileRepo: EmployeeProfileRepo,
    ) { }

    async searchEmployeeProfiles(user: UserI, filters: EmployeeProfileSearchFilters): Promise<EmployeeProfileSearchResponse> {
        const queryBuilder = this.employeeProfileRepo.getQueryBuilder()
            .leftJoinAndSelect('profile.availabilityDateRanges', 'ranges');

        // --- Fix: parse arrays from query string if needed ---
        const parseArray = (val: any): string[] | undefined => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string' && val.length > 0) return val.split(',');
            return undefined;
        };

        const skills = parseArray(filters.skills);
        const certificates = parseArray(filters.certificates);
        const communicationLanguages = parseArray(filters.communicationLanguages);

        let hasFilter = false;

        // Base condition - only ACTIVE profiles
        queryBuilder.where('profile.status = :status', { status: EmployeeProfileStatuses.ACTIVE });

        this.addDateRangeFilter(queryBuilder, filters, hasFilter);

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

        if (filters.locationCountry) {
            queryBuilder.andWhere(':locationCountry = ANY (profile.location_countries)', { locationCountry: filters.locationCountry });
            hasFilter = true;
        }

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
        if (filters.skip) {
            queryBuilder.skip(filters.skip);
        }
        if (filters.limit) {
            queryBuilder.take(filters.limit);
        }
        
        const results = await queryBuilder.getMany();
        return {
            profiles: results,
            count
        };
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
}
