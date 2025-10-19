/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { EmployeeProfileRepo } from './EmployeeProfileRepo';
import { EmployeeProfileForm } from '@shared/def/employee-profile.def';
import { EmployeeProfileEntity } from 'employee/model/EmployeeProfileEntity';
import { UserI } from '@shared/interfaces/UserI';
import { EmployeeProfileI, EmployeeProfileLocationOptions, EmployeeProfileStatus, EmployeeProfileStatuses } from '@shared/interfaces/EmployeeProfileI';
import { ToastException } from 'global/exceptions/ToastException';
import { EPUtil } from './EPUtil';
import { GeoPointService } from './GeoPointService';

@Injectable()
export class EmployeeProfileService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly employeeProfileRepo: EmployeeProfileRepo,
        private readonly geoPointService: GeoPointService,
    ) { }

    public getEmployeeProfile(user: UserI): Promise<EmployeeProfileEntity | null> {
        return this.employeeProfileRepo.findByUid(user.uid);
    }

    public async createEmployeeProfile(user: UserI, form: EmployeeProfileForm): Promise<EmployeeProfileEntity> {
        const exists = await this.employeeProfileRepo.findByUid(user.uid);
        if (exists) {
            // TODO translation
            throw new ToastException("Employee profile already exists for this user", this);
        }

        const profile = await this.prepareProfile(user, form);
        const result = await this.employeeProfileRepo.create(profile);
        return result;
    }

    public async updateEmployeeProfile(user: UserI, form: EmployeeProfileForm): Promise<EmployeeProfileEntity> {
        const profile = await this.prepareProfile(user, form);

        return this.employeeProfileRepo.update(profile);
    }

    private async prepareProfile(user: UserI, form: EmployeeProfileForm): Promise<EmployeeProfileI> {
        const status = this.getProfileStatus(user, form);
        let profile: EmployeeProfileI = EPUtil.buildEmployeeProfileFromForm(user, form, status)

        if (profile.locationOption === EmployeeProfileLocationOptions.DISTANCE) {
            profile.locationCountries = await this.geoPointService.getCountriesInRadius(
                form.locationDistancePosition!.lat,
                form.locationDistancePosition!.lng,
                form.locationDistanceRadius || 0
            );
        } else {
            delete profile.point;
            delete profile.pointRadius;
            delete profile.address;
        }
        EPUtil.validateProfile(profile);
        return profile;
    }


    private getProfileStatus(user: UserI, form: EmployeeProfileForm): EmployeeProfileStatus {
        // TODO
        return EmployeeProfileStatuses.INACTIVE
    }

}
