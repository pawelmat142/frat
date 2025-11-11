/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { EmployeeProfileRepo } from './EmployeeProfileRepo';
import { UserI } from '@shared/interfaces/UserI';
import { EmployeeProfileI, EmployeeProfileSearchForm, EmployeeProfileSearchResponse, EmployeeProfileStatuses } from '@shared/interfaces/EmployeeProfileI';

@Injectable()
export class SearchEmployeeProfileService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly employeeProfileRepo: EmployeeProfileRepo,
    ) { }

    // TODO implement search logic
    // 3. location filters,
    // sort / waga
    
    // TODO add date ranges filter
    // 1. front
    // 2. backend 
    // TODO sensowne indexy na searach

    async searchEmployeeProfiles(user: UserI, query: EmployeeProfileSearchForm): Promise<EmployeeProfileSearchResponse> {
        const queryBuilder = this.employeeProfileRepo.getQueryBuilder()

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

        queryBuilder.where('profile.status = :status', { status: EmployeeProfileStatuses.ACTIVE });

        if (communicationLanguages?.length) {
            queryBuilder.andWhere('profile.communication_languages && :languages', { languages: communicationLanguages });
            hasFilter = true;
        }
        if (certificates?.length) {
            queryBuilder.andWhere('profile.certificates && :certificates', { certificates });
            hasFilter = true;
        }
        if (skills?.length) {
            queryBuilder.andWhere('profile.skills && :skills', { skills });
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

        console.log('Count of profiles matching filters:', count);

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
}
