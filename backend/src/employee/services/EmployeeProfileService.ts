/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { EmployeeProfileRepo } from './EmployeeProfileRepo';
import { EmployeeProfileForm } from '@shared/def/employee-profile.def';
import { EmployeeProfileEntity } from 'employee/model/EmployeeProfileEntity';
import { UserI } from '@shared/interfaces/UserI';


@Injectable()
export class EmployeeProfileService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly employeeProfileRepo: EmployeeProfileRepo,
    ) { }

    public async createEmployeeProfile(user: UserI, form: EmployeeProfileForm): Promise<EmployeeProfileEntity> {
        this.logger.log(`Creating employee profile for user ${user.uid}`, form);
        return null;
    }
}
