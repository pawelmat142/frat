import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EmployeeProfileForm } from "@shared/def/employee-profile.def";
import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import { ObjUtil } from "@shared/utils/ObjUtil";
import { EmployeeProfileEntity } from "employee/model/EmployeeProfileEntity";
import { ToastException } from "global/exceptions/ToastException";
import { Repository } from "typeorm";

@Injectable()
export class EmployeeProfileRepo {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(EmployeeProfileEntity)
        private employeeProfileRepository: Repository<EmployeeProfileEntity>,
    ) { }

    public findByUid(uid: string): Promise<EmployeeProfileEntity | null> {
        return this.employeeProfileRepository.findOne({ where: { uid } });
    }

    public async create(newProfile: EmployeeProfileI): Promise<EmployeeProfileEntity> {
        const entity = this.employeeProfileRepository.create(newProfile)
        const saved = await this.employeeProfileRepository.save(entity);
        this.logger.log(`Created Employee Profile: ${saved.employeeProfileId}`);
        return saved;
    }

    public async update(newProfile: EmployeeProfileI): Promise<EmployeeProfileEntity> {
        const profile = await this.findByUid(newProfile.uid);
        if (!profile) {
            throw new ToastException("Employee profile not found for update", this);
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
            // TODO translation
            throw new ToastException("No changes detected in the employee profile", this);
        }

        const saved = await this.employeeProfileRepository.save(profile);
        this.logger.log(`Updated Employee Profile: ${saved.employeeProfileId}, uid: ${saved.uid}, version: ${saved.version}`);
        return saved;
    }
}