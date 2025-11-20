import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EmployeeProfileAvailabilityOptions, EmployeeProfileI, EmployeeProfileStatus } from "@shared/interfaces/EmployeeProfileI";
import { ObjUtil } from "@shared/utils/ObjUtil";
import { EmployeeProfileEntity } from "employee/model/EmployeeProfileEntity";
import { ToastException } from "global/exceptions/ToastException";
import { DeepPartial, FindManyOptions, Repository, SelectQueryBuilder } from "typeorm";
import { DateRangeEntity } from "employee/model/DateRangeEntity";
import { EmployeeProfilesInitialData } from "./EmployeeProfilesInitialData";

@Injectable()
export class EmployeeProfileRepo {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(EmployeeProfileEntity)
        private employeeProfileRepository: Repository<EmployeeProfileEntity>,
    ) { }

    public findAll(options?: FindManyOptions<EmployeeProfileEntity>): Promise<EmployeeProfileEntity[]> {
        return this.employeeProfileRepository.find(options);
    }

    public async findByUid(uid: string): Promise<EmployeeProfileEntity | null> {
        const result = await this.employeeProfileRepository.findOne({ where: { uid } });
        if (result?.availabilityDateRanges) {
            this.sortRanges([result]);
        }
        return result;
    }

    public async findByDisplayName(displayName: string): Promise<EmployeeProfileEntity | null> {
        const result = await this.employeeProfileRepository.findOne({ where: { displayName } });
        if (!result) {
            throw new ToastException("validation.notFound", this);
        }
        if (result?.availabilityDateRanges) {
            this.sortRanges([result]);
        }
        return result;
    }

    private sortRanges(profiles: EmployeeProfileEntity[]): void {
        profiles.forEach(profile => {
            profile.availabilityDateRanges.sort((a, b) => a.id - b.id);
        });
    }

    public async create(newProfile: DeepPartial<EmployeeProfileEntity>): Promise<EmployeeProfileEntity> {
        const entity = this.employeeProfileRepository.create(newProfile)
        const saved = await this.employeeProfileRepository.save(entity);
        this.logger.log(`Created Employee Profile: ${saved.employeeProfileId}`);
        return saved;
    }

    public async activation(id: number, status: EmployeeProfileStatus): Promise<EmployeeProfileEntity> {
        const profile = await this.employeeProfileRepository.findOne({ where: { employeeProfileId: id } });
        if (!profile) {
            throw new NotFoundException("employeeProfile.notFound");
        }
        if (profile.status === status) {
            throw new ToastException("employeeProfile.alreadyInStatus", this);
        }

        this.logger.log(`Activating EmployeeProfile id=${id}: status from ${profile.status} to ${status}`);
        profile.status = status;
        const saved = await this.employeeProfileRepository.save(profile);
        return saved;
    }

    public async delete(id: number): Promise<void> {
        const profile = await this.employeeProfileRepository.findOne({ where: { employeeProfileId: id } });
        if (!profile) {
            throw new NotFoundException("employeeProfile.notFound");
        }
        await this.employeeProfileRepository.remove(profile);
        this.logger.log(`Deleted EmployeeProfile id=${id}`);
    }

    public async deleteAllProfiles(): Promise<void> {
        // Use raw SQL DELETE to avoid empty criteria error and respect FK constraints
        const manager = this.employeeProfileRepository.manager;
        await manager.query('DELETE FROM jh_employee_profile_availability_date_ranges');
        await manager.query('DELETE FROM jh_employee_profiles');
        this.logger.log('All employee profiles and related date ranges deleted');
    }


    public async initialLoad(profiles: EmployeeProfileI[]): Promise<void> {
        await this.employeeProfileRepository.save(profiles);
    }

    public async update(newProfile: DeepPartial<EmployeeProfileEntity>): Promise<EmployeeProfileEntity> {
        const profile = await this.findByUid(newProfile.uid);
        if (!profile) {
            throw new ToastException("employeeProfile.notFound", this);
        }

        let updatedFlag = false

        if (profile.status !== newProfile.status) {
            this.logger.log(`Updating EmployeeProfile status from ${profile.status} to ${newProfile.status}`);
            profile.status = newProfile.status;
            updatedFlag = true;
        }

        if (profile.displayName !== newProfile.displayName) {
            this.logger.log(`Updating EmployeeProfile displayName from ${profile.displayName} to ${newProfile.displayName}`);
            profile.displayName = newProfile.displayName;
            updatedFlag = true;
        }

        if (profile.email !== newProfile.email) {
            this.logger.log(`Updating EmployeeProfile email from ${profile.email} to ${newProfile.email}`);
            profile.email = newProfile.email;
            updatedFlag = true;
        }

        if (profile.firstName !== newProfile.firstName) {
            this.logger.log(`Updating EmployeeProfile firstName from ${profile.firstName} to ${newProfile.firstName}`);
            profile.firstName = newProfile.firstName;
            updatedFlag = true;
        }

        if (ObjUtil.arrayChanged(profile.skills, newProfile.skills || [])) {
            this.logger.log(`Updating EmployeeProfile skills from ${profile.skills} to ${newProfile.skills}`);
            profile.skills = newProfile.skills || [];
            updatedFlag = true;
        }

        if (ObjUtil.arrayChanged(profile.certificates, newProfile.certificates || [])) {
            this.logger.log(`Updating EmployeeProfile certificates from ${profile.certificates} to ${newProfile.certificates}`);
            profile.certificates = newProfile.certificates || [];
            updatedFlag = true;
        }

        if (ObjUtil.arrayChanged(profile.communicationLanguages, newProfile.communicationLanguages || [])) {
            this.logger.log(`Updating EmployeeProfile communicationLanguages from ${profile.communicationLanguages} to ${newProfile.communicationLanguages}`);
            profile.communicationLanguages = newProfile.communicationLanguages || [];
            updatedFlag = true;
        }

        if (profile.locationOption !== newProfile.locationOption) {
            this.logger.log(`Updating EmployeeProfile locationOption from ${profile.locationOption} to ${newProfile.locationOption}`);
            profile.locationOption = newProfile.locationOption;
            updatedFlag = true;
        }

        if (ObjUtil.arrayChanged(profile.locationCountries, newProfile.locationCountries || [])) {
            this.logger.log(`Updating EmployeeProfile locationCountries from ${profile.locationCountries} to ${newProfile.locationCountries}`);
            profile.locationCountries = newProfile.locationCountries || [];
            updatedFlag = true;
        }

        if (ObjUtil.numberArrayChanged(profile.point?.coordinates || [], newProfile.point?.coordinates || [])) {
            this.logger.log(`Updating EmployeeProfile point from ${JSON.stringify(profile.point)} to ${JSON.stringify(newProfile.point)}`);
            const normalizedPoint = {
                type: 'Point' as const,
                coordinates: (newProfile.point?.coordinates || profile.point?.coordinates || []) as [number, number],
            };
            profile.point = normalizedPoint;
            updatedFlag = true;
        }
        if (profile.pointRadius !== newProfile.pointRadius) {
            this.logger.log(`Updating EmployeeProfile pointRadius from ${profile.pointRadius} to ${newProfile.pointRadius}`);
            profile.pointRadius = newProfile.pointRadius;
            updatedFlag = true;
        }

        if (profile.availabilityOption !== newProfile.availabilityOption) {
            this.logger.log(`Updating EmployeeProfile availabilityOption from ${profile.availabilityOption} to ${newProfile.availabilityOption}`);
            profile.availabilityOption = newProfile.availabilityOption;
            if (newProfile.availabilityOption === EmployeeProfileAvailabilityOptions.ANYTIME) {
                await this.removeRelatedDateRanges(profile.employeeProfileId);
                profile.availabilityDateRanges = [];
            }
            updatedFlag = true;
        }

        if (this.dateRangesChanged(newProfile, profile)) {
            this.logger.log(`Updating EmployeeProfile availabilityDateRanges`);
            // Normalize DeepPartial<DateRangeEntity>[] into DateRangeEntity[] to satisfy typing.
            const incomingRanges = (newProfile.availabilityDateRanges || []);
            const normalizedRanges: DateRangeEntity[] = [];
            for (const r of incomingRanges) {
                // ensure required field is present
                if (!r.dateRange) {
                    throw new ToastException("employeeProfile.invalidDateRange", this);
                }
                const dr = new DateRangeEntity();
                // preserve id when provided
                if ((r as any).id !== undefined) {
                    dr.id = (r as any).id;
                }
                dr.dateRange = r.dateRange as string;
                // set tables relation
                dr.employeeProfile = { employeeProfileId: profile.employeeProfileId } as EmployeeProfileEntity;
                normalizedRanges.push(dr);
            }
            profile.availabilityDateRanges = normalizedRanges;
            updatedFlag = true;
        }


        if (!updatedFlag) {
            throw new ToastException("employeeProfile.noChanges", this);
        }

        const saved = await this.employeeProfileRepository.save(profile);
        this.logger.log(`Updated Employee Profile: ${saved.employeeProfileId}, uid: ${saved.uid}, version: ${saved.version}`);
        return saved;
    }

    private dateRangesChanged(newProfile: DeepPartial<EmployeeProfileEntity>, profile: EmployeeProfileEntity): boolean {
        const newRanges = (newProfile.availabilityDateRanges || []);
        const oldRanges = (profile.availabilityDateRanges || []);
        if (newRanges.length !== oldRanges.length) return true;
        for (let i = 0; i < newRanges.length; i++) {
            const newRange = newRanges[i];
            const oldRange = oldRanges[i];
            if (newRange.dateRange !== oldRange.dateRange) {
                return true;
            }
        }
        return false;
    }

    private async removeRelatedDateRanges(profileId: number): Promise<void> {
        const manager = this.employeeProfileRepository.manager;
        await manager.query(
            'DELETE FROM jh_employee_profile_availability_date_ranges WHERE employee_profile_id = $1',
            [profileId]
        );
    }

    public getQueryBuilder(): SelectQueryBuilder<EmployeeProfileEntity> {
        return this.employeeProfileRepository.createQueryBuilder('profile');
    }

    public async deleteAll(): Promise<void> {
        await this.employeeProfileRepository.clear();
        this.logger.log('All employee profiles deleted');
    }
}