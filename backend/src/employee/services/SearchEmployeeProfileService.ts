/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { EmployeeProfileRepo } from './EmployeeProfileRepo';
import { UserI } from '@shared/interfaces/UserI';
import { EmployeeProfileI } from '@shared/interfaces/EmployeeProfileI';
import { EmployeeProfileSearchForm } from '@shared/def/employee-profile.def';

@Injectable()
export class SearchEmployeeProfileService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly employeeProfileRepo: EmployeeProfileRepo,
    ) { }

    // TODO implement search logic
    // 2. free text filters, - display name, last name, first name, mail
    // 3. location filters,
    // sort / waga
    // TODO presentation
    // TODO add date ranges filter
    // 1. front
    // 2. backend 
    // TODO sensowne indexy na searach

    async searchEmployeeProfiles(user: UserI, query: EmployeeProfileSearchForm): Promise<EmployeeProfileI[]> {
        const queryBuilder = this.employeeProfileRepo.getQueryBuilder()

        let hasFilter = false;
        
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

        // If no filters, return empty array (or all results if desired)
        if (!hasFilter) {
            return [];
        }

        const results = await queryBuilder.getMany();
        return results;
    }
}
