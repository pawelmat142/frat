import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EmployeeProfileI, EmployeeProfileStatus } from "@shared/interfaces/EmployeeProfileI";
import { ObjUtil } from "@shared/utils/ObjUtil";
import { EmployeeProfileEntity } from "employee/model/EmployeeProfileEntity";
import { EmployeeProfileParams } from "employee/model/interface";
import { ToastException } from "global/exceptions/ToastException";
import { FindManyOptions, Repository, SelectQueryBuilder } from "typeorm";
import { EmoployeeProfilesInitialData } from "./EmployeeProfilesInitialData";

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

    public findByUid(uid: string): Promise<EmployeeProfileEntity | null> {
        return this.employeeProfileRepository.findOne({ where: { uid } });
    }

    public async create(newProfile: EmployeeProfileParams): Promise<EmployeeProfileEntity> {
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
            // TODO trasnlation
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
        await this.employeeProfileRepository.clear();
        this.logger.log('All employee profiles deleted');
    }

    public async initialLoad(): Promise<void> {
        const profiles = EmoployeeProfilesInitialData
        await this.employeeProfileRepository.save(profiles);
    }

    public async update(newProfile: EmployeeProfileParams): Promise<EmployeeProfileEntity> {
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
            profile.point = newProfile.point;
            updatedFlag = true;
        }
        if (profile.pointRadius !== newProfile.pointRadius) {
            this.logger.log(`Updating EmployeeProfile pointRadius from ${profile.pointRadius} to ${newProfile.pointRadius}`);
            profile.pointRadius = newProfile.pointRadius;
            updatedFlag = true;
        }

        if (!updatedFlag) {
            throw new ToastException("employeeProfile.noChanges", this);
        }

        const saved = await this.employeeProfileRepository.save(profile);
        this.logger.log(`Updated Employee Profile: ${saved.employeeProfileId}, uid: ${saved.uid}, version: ${saved.version}`);
        return saved;
    }

    public getQueryBuilder(): SelectQueryBuilder<EmployeeProfileEntity> {
        return this.employeeProfileRepository.createQueryBuilder('profile');
    }

    public async deleteAll(): Promise<void> {
        await this.employeeProfileRepository.clear();
        this.logger.log('All employee profiles deleted');
    }
}