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
    ) { }

    // TODO implement search logic
    // 1. dictionary filters,
    // 2. free text filters, - display name, last name, first name, mail
    // 3. location filters,
    // sort / waga
    // TODO presentation
    // TODO add date ranges filter
    // 1. front
    // 2. backend 

    async searchEmployeeProfiles(user: UserI, query: EmployeeProfileSearchForm): Promise<EmployeeProfileI[]> {
        console.log(user)
        console.log(query)
        return []
    }
}
