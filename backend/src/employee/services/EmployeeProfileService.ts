/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { EmployeeProfileRepo } from './EmployeeProfileRepo';
import { EmployeeProfileEntity } from 'employee/model/EmployeeProfileEntity';
import { UserI } from '@shared/interfaces/UserI';
import { EmployeeProfileAvailabilityOptions, EmployeeProfileFormDto, EmployeeProfileLocationOptions, EmployeeProfileStatus, EmployeeProfileStatuses } from '@shared/interfaces/EmployeeProfileI';
import { ToastException } from 'global/exceptions/ToastException';
import { EPUtil } from './EPUtil';
import { GeoPointService } from './GeoPointService';
import { DeepPartial } from 'typeorm';
import { DateRangeUtil } from '@shared/utils/DateRangeUtil';

@Injectable()
export class EmployeeProfileService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly employeeProfileRepo: EmployeeProfileRepo,
        private readonly geoPointService: GeoPointService,
    ) { }

    public listProfiles(): Promise<EmployeeProfileEntity[]> {
        return this.employeeProfileRepo.findAll();
    }

    public activation(id: number, status: EmployeeProfileStatus): Promise<EmployeeProfileEntity> {
        return this.employeeProfileRepo.activation(id, status);
    }

    public deleteProfile(id: number): Promise<void> {
        return this.employeeProfileRepo.delete(id);
    }

    public deleteAllProfiles(): Promise<void> {
        return this.employeeProfileRepo.deleteAllProfiles();
    }

    public async initialLoad(): Promise<void> {
        try {
            return await this.employeeProfileRepo.initialLoad();
        } catch (e) {
            console.error(e)
            // TODO translation
            throw new ToastException('employeeProfile.initialLoadFailed', this);
        }
    }

    public getEmployeeProfile(user: UserI): Promise<EmployeeProfileEntity | null> {
        return this.employeeProfileRepo.findByUid(user.uid);
    }

    public getEmployeeProfileByDisplayName(displayName: string): Promise<EmployeeProfileEntity | null> {
        return this.employeeProfileRepo.findByDisplayName(displayName);
    }

    public async createEmployeeProfile(user: UserI, form: EmployeeProfileFormDto): Promise<EmployeeProfileEntity> {
        const exists = await this.employeeProfileRepo.findByUid(user.uid);
        if (exists) {
            throw new ToastException('employeeProfile.exists', this);
        }

        const profile = await this.prepareProfile(user, form);
        const result = await this.employeeProfileRepo.create(profile);
        return result;
    }

    public async updateEmployeeProfile(user: UserI, form: EmployeeProfileFormDto): Promise<EmployeeProfileEntity> {
        const profile = await this.prepareProfile(user, form);
        return this.employeeProfileRepo.update(profile);
    }

    private async prepareProfile(user: UserI, form: EmployeeProfileFormDto): Promise<DeepPartial<EmployeeProfileEntity>> {
        const status = this.getProfileStatus(user, form);

        const result: DeepPartial<EmployeeProfileEntity> = {
            employeeProfileId: 0,
            uid: user.uid,
            status: status,
            displayName: user.displayName,
            email: user.email,

            firstName: form.firstName,
            lastName: form.lastName,
            residenceCountry: form.residenceCountry,

            skills: form.skills || [],
            certificates: form.certificates || [],
            communicationLanguages: form.communicationLanguages || [],

            locationOption: form.locationOption,

            availabilityOption: form.availabilityOption,
        };

        await this.fillLocationData(result, form);
        this.fillAvailabilityData(result, form);

        EPUtil.validateProfile(result);
        return result;
    }

    private fillAvailabilityData(result: DeepPartial<EmployeeProfileEntity>, form: EmployeeProfileFormDto): void {
        if (result.availabilityOption === EmployeeProfileAvailabilityOptions.DATE_RANGES) {
            result.availabilityDateRanges = form.availabilityDateRanges.map(dateRange => DateRangeUtil.fromDateRange([], dateRange));
        } if (result.availabilityOption === EmployeeProfileAvailabilityOptions.FROM_DATE) {
            const rangeInput = form.availabilityDateRanges[0];
            if (!rangeInput) {
                // TODO translation
                throw new ToastException("Missing start date!", this);
            }
            result.availabilityDateRanges = [DateRangeUtil.fromDateRange([], rangeInput)];

        } else {
            delete result.availabilityDateRanges
        }
    }

    private async fillLocationData(result: DeepPartial<EmployeeProfileEntity>, form: EmployeeProfileFormDto): Promise<void> {
        EPUtil.fillLocationData(result, form)

        if (result.locationOption === EmployeeProfileLocationOptions.DISTANCE) {
            result.locationCountries = await this.geoPointService.getCountriesInRadius(
                form.locationDistancePosition!.lat,
                form.locationDistancePosition!.lng,
                form.locationDistanceRadius || 0
            );
        } else {
            delete result.point;
            delete result.pointRadius;
            delete result.address;
        }
    }

    private getProfileStatus(user: UserI, form: EmployeeProfileFormDto): EmployeeProfileStatus {
        // TODO
        return EmployeeProfileStatuses.ACTIVE;
    }

}
