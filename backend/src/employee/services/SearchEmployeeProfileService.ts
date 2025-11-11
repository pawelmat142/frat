/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { EmployeeProfileRepo } from './EmployeeProfileRepo';
import { UserI } from '@shared/interfaces/UserI';
import { EmployeeProfileI, EmployeeProfileSearchForm, EmployeeProfileStatuses } from '@shared/interfaces/EmployeeProfileI';

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

    async searchEmployeeProfiles(user: UserI, query: EmployeeProfileSearchForm): Promise<EmployeeProfileI[]> {
        const queryBuilder = this.employeeProfileRepo.getQueryBuilder()

        let hasFilter = false;

        queryBuilder.where('profile.status = :status', { status: EmployeeProfileStatuses.ACTIVE });
        
        if (query.communicationLanguages?.length) {
            queryBuilder.andWhere('profile.communication_languages && :languages', { languages: query.communicationLanguages });
            hasFilter = true;
        }
        if (query.certificates?.length) {
            queryBuilder.andWhere('profile.certificates && :certificates', { certificates: query.certificates });
            hasFilter = true;
        }
        if (query.skills?.length) {
            queryBuilder.andWhere('profile.skills && :skills', { skills: query.skills });
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

        console.log(query)

        // If no filters, return empty array (or all results if desired)
        if (!hasFilter) {
            return [];
        }

        const results = await queryBuilder.getMany();
        return results;
    }
}
