import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { WorkerAvailabilityOptions, WorkerI, WorkerSkills, WorkerStatus } from "@shared/interfaces/WorkerI";
import { ObjUtil } from "@shared/utils/ObjUtil";
import { WorkerEntity } from "employee/model/WorkerEntity";
import { ToastException } from "global/exceptions/ToastException";
import { DeepPartial, FindManyOptions, Repository, SelectQueryBuilder } from "typeorm";
import { DateRangeEntity } from "employee/model/DateRangeEntity";

@Injectable()
export class WorkerRepo {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(WorkerEntity)
        private woerkersRepository: Repository<WorkerEntity>,
    ) { }

    public findAll(options?: FindManyOptions<WorkerEntity>): Promise<WorkerEntity[]> {
        return this.woerkersRepository.find(options);
    }

    public getById(workerId: number): Promise<WorkerEntity | null> {
        return this.woerkersRepository.findOne({ where: { workerId } });
    }

    public async findByUid(uid: string): Promise<WorkerEntity | null> {
        const result = await this.woerkersRepository.findOne({ where: { uid } });
        if (result?.availabilityDateRanges) {
            this.sortRanges([result]);
        }
        return result;
    }

    public async findByDisplayName(displayName: string): Promise<WorkerEntity | null> {
        const result = await this.woerkersRepository.findOne({ where: { displayName } });
        if (!result) {
            return null;
        }
        if (result?.availabilityDateRanges) {
            this.sortRanges([result]);
        }
        return result;
    }

    private sortRanges(profiles: WorkerEntity[]): void {
        profiles.forEach(profile => {
            profile.availabilityDateRanges.sort((a, b) => a.id - b.id);
        });
    }

    public async create(newProfile: DeepPartial<WorkerEntity>): Promise<WorkerEntity> {
        const entity = this.woerkersRepository.create(newProfile)
        const saved = await this.woerkersRepository.save(entity);
        this.logger.log(`Created Employee Profile: ${saved.workerId}`);
        return saved;
    }

    public async activation(id: number, status: WorkerStatus): Promise<WorkerEntity> {
        const profile = await this.woerkersRepository.findOne({ where: { workerId: id } });
        if (!profile) {
            throw new NotFoundException("employeeProfile.notFound");
        }
        if (profile.status === status) {
            throw new ToastException("employeeProfile.alreadyInStatus", this);
        }

        this.logger.log(`Activating EmployeeProfile id=${id}: status from ${profile.status} to ${status}`);
        profile.status = status;
        const saved = await this.woerkersRepository.save(profile);
        return saved;
    }

    public async delete(workerId: number): Promise<void> {
        const profile = await this.woerkersRepository.findOne({ where: { workerId } });
        if (!profile) {
            throw new NotFoundException("employeeProfile.notFound");
        }
        await this.woerkersRepository.remove(profile);
        this.logger.log(`Deleted EmployeeProfile id=${workerId}`);
    }

    public async deleteAllProfiles(): Promise<void> {
        // Use raw SQL DELETE to avoid empty criteria error and respect FK constraints
        const manager = this.woerkersRepository.manager;
        await manager.query('DELETE FROM jh_workers_date_ranges');
        await manager.query('DELETE FROM jh_workers');
        this.logger.log('All employee profiles and related date ranges deleted');
    }


    public async initialLoad(profiles: WorkerI[]): Promise<void> {
        await this.woerkersRepository.save(profiles);
    }

    public async update(newWorker: DeepPartial<WorkerEntity>, anotherChange?: boolean): Promise<WorkerEntity> {
        const worker = await this.findByUid(newWorker.uid);
        if (!worker) {
            throw new ToastException("employeeProfile.notFound", this);
        }

        let updatedFlag = false

        if (worker.status !== newWorker.status) {
            this.logger.log(`Updating EmployeeProfile status from ${worker.status} to ${newWorker.status}`);
            worker.status = newWorker.status;
            updatedFlag = true;
        }

        if (worker.displayName !== newWorker.displayName) {
            this.logger.log(`Updating EmployeeProfile displayName from ${worker.displayName} to ${newWorker.displayName}`);
            worker.displayName = newWorker.displayName;
            updatedFlag = true;
        }

        if (worker.email !== newWorker.email) {
            this.logger.log(`Updating EmployeeProfile email from ${worker.email} to ${newWorker.email}`);
            worker.email = newWorker.email;
            updatedFlag = true;
        }

        if (worker.fullName !== newWorker.fullName) {
            this.logger.log(`Updating EmployeeProfile fullName from ${worker.fullName} to ${newWorker.fullName}`);
            worker.fullName = newWorker.fullName;
            updatedFlag = true;
        }

        const phoneChanged = worker.phoneNumber?.prefix !== newWorker.phoneNumber?.prefix
            || worker.phoneNumber?.number !== newWorker.phoneNumber?.number;
        if (phoneChanged) {
            this.logger.log(`Updating EmployeeProfile phoneNumber from ${JSON.stringify(worker.phoneNumber)} to ${JSON.stringify(newWorker.phoneNumber)}`);
            worker.phoneNumber = newWorker.phoneNumber as any;
            updatedFlag = true;
        }

        if (worker.avatarRef?.publicId !== newWorker.avatarRef?.publicId) {
            this.logger.log(`Updating EmployeeProfile avatarRef from ${JSON.stringify(worker.avatarRef)} to ${JSON.stringify(newWorker.avatarRef)}`);
            worker.avatarRef = {
                publicId: newWorker.avatarRef?.publicId || '',
                url: newWorker.avatarRef?.url || ''
            };
            updatedFlag = true;
        }

        if (ObjUtil.arrayChanged(worker.categories, newWorker.categories || [])) {
            this.logger.log(`Updating EmployeeProfile categories from ${worker.categories} to ${newWorker.categories}`);
            worker.categories = newWorker.categories || [];
            updatedFlag = true;
        }

        if (worker.bio !== newWorker.bio) {
            this.logger.log(`Updating EmployeeProfile bio from ${worker.bio} to ${newWorker.bio}`);
            worker.bio = newWorker.bio || '';
            updatedFlag = true;
        }

        if (worker.careerStartDate !== newWorker.careerStartDate) {
            this.logger.log(`Updating EmployeeProfile careerStartDate from ${worker.careerStartDate} to ${newWorker.careerStartDate}`);
            worker.careerStartDate = newWorker.careerStartDate || null;
            updatedFlag = true;
        }

        if (worker.maxAltitude !== newWorker.maxAltitude) {
            this.logger.log(`Updating EmployeeProfile maxAltitude from ${worker.maxAltitude} to ${newWorker.maxAltitude}`);
            worker.maxAltitude = newWorker.maxAltitude || null;
            updatedFlag = true;
        }

        if (JSON.stringify(worker.skills) !== JSON.stringify(newWorker.skills)) {
            this.logger.log(`Updating EmployeeProfile skills from ${JSON.stringify(worker.skills)} to ${JSON.stringify(newWorker.skills)}`);
            worker.skills = newWorker.skills as WorkerSkills
            updatedFlag = true;
        }

        if (worker.readyToTravel !== newWorker.readyToTravel) {
            this.logger.log(`Updating EmployeeProfile readyToTravel from ${worker.readyToTravel} to ${newWorker.readyToTravel}`);
            worker.readyToTravel = newWorker.readyToTravel || null;
            updatedFlag = true;
        }

        if (ObjUtil.arrayChanged(worker.certificates, newWorker.certificates || [])) {
            this.logger.log(`Updating EmployeeProfile certificates from ${worker.certificates} to ${newWorker.certificates}`);
            worker.certificates = newWorker.certificates || [];
            updatedFlag = true;
        }

        if (ObjUtil.arrayChanged(worker.communicationLanguages, newWorker.communicationLanguages || [])) {
            this.logger.log(`Updating EmployeeProfile communicationLanguages from ${worker.communicationLanguages} to ${newWorker.communicationLanguages}`);
            worker.communicationLanguages = newWorker.communicationLanguages || [];
            updatedFlag = true;
        }

        if (ObjUtil.arrayChanged(worker.views, newWorker.views || [])) {
            this.logger.log(`Updating EmployeeProfile views from ${worker.views} to ${newWorker.views}`);
            worker.views = newWorker.views || [];
            updatedFlag = true;
        }

        if (ObjUtil.arrayChanged(worker.jobs, newWorker.jobs || [])) {
            this.logger.log(`Updating EmployeeProfile jobs from ${worker.jobs} to ${newWorker.jobs}`);
            worker.jobs = newWorker.jobs || [];
            updatedFlag = true;
        }

        if (worker.locationOption !== newWorker.locationOption) {
            this.logger.log(`Updating EmployeeProfile locationOption from ${worker.locationOption} to ${newWorker.locationOption}`);
            worker.locationOption = newWorker.locationOption;
            updatedFlag = true;
        }

        if (ObjUtil.arrayChanged(worker.locationCountries || [], newWorker.locationCountries || [])) {
            this.logger.log(`Updating EmployeeProfile locationCountries from ${worker.locationCountries} to ${newWorker.locationCountries}`);
            worker.locationCountries = newWorker.locationCountries || [];
            updatedFlag = true;
        }

        if (ObjUtil.numberArrayChanged(worker.point?.coordinates || [], newWorker.point?.coordinates || [])) {
            this.logger.log(`Updating EmployeeProfile point from ${JSON.stringify(worker.point)} to ${JSON.stringify(newWorker.point)}`);
            const normalizedPoint = {
                type: 'Point' as const,
                coordinates: (newWorker.point?.coordinates || worker.point?.coordinates || []) as [number, number],
            };
            worker.point = normalizedPoint;
            updatedFlag = true;
        }

        if (worker.availabilityOption !== newWorker.availabilityOption) {
            this.logger.log(`Updating EmployeeProfile availabilityOption from ${worker.availabilityOption} to ${newWorker.availabilityOption}`);
            worker.availabilityOption = newWorker.availabilityOption;
            if (newWorker.availabilityOption === WorkerAvailabilityOptions.ANYTIME) {
                await this.removeRelatedDateRanges(worker.workerId);
                worker.availabilityDateRanges = [];
            }
            updatedFlag = true;
        }

        if (ObjUtil.arrayChanged(worker.likes, newWorker.likes || [])) {
            this.logger.log(`Updating EmployeeProfile likes from ${worker.likes} to ${newWorker.likes}`);
            worker.likes = newWorker.likes || [];
            updatedFlag = true;
        }

        if (this.dateRangesChanged(newWorker, worker)) {
            this.logger.log(`Updating EmployeeProfile availabilityDateRanges`);
            // Normalize DeepPartial<DateRangeEntity>[] into DateRangeEntity[] to satisfy typing.
            const incomingRanges = (newWorker.availabilityDateRanges || []);
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
                dr.worker = { workerId: worker.workerId } as WorkerEntity;
                normalizedRanges.push(dr);
            }
            worker.availabilityDateRanges = normalizedRanges;
            updatedFlag = true;
        }

        if (newWorker.startDate !== worker.startDate) {
            this.logger.log(`Updating EmployeeProfile startDate from ${worker.startDate} to ${newWorker.startDate}`);
            worker.startDate = newWorker.startDate || null;
            updatedFlag = true;
        }

        if (this.imagesChanges(newWorker, worker)) {
            this.logger.log(`Updating EmployeeProfile images from ${JSON.stringify(worker.images)} to ${JSON.stringify(newWorker.images)}`);
            worker.images = newWorker.images.map(i => ({ publicId: i.publicId ?? '', url: i.url ?? '' }));
            updatedFlag = true;
        }

        if (!updatedFlag && !anotherChange) {
            throw new ToastException("employeeProfile.noChanges", this);
        }

        const saved = await this.woerkersRepository.save(worker);
        this.logger.log(`Updated Employee Profile: ${saved.workerId}, uid: ${saved.uid}, version: ${saved.version}`);
        return saved;
    }

    private imagesChanges(newProfile: DeepPartial<WorkerEntity>, profile: WorkerEntity): boolean {
        const newIds = newProfile.images?.map(i => i.publicId) || [];
        const oldIds = profile.images?.map(i => i.publicId) || [];
        return ObjUtil.arrayChanged(newIds, oldIds);
    }

    private dateRangesChanged(newProfile: DeepPartial<WorkerEntity>, profile: WorkerEntity): boolean {
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
        const manager = this.woerkersRepository.manager;
        await manager.query(
            'DELETE FROM jh_employee_profile_availability_date_ranges WHERE employee_profile_id = $1',
            [profileId]
        );
    }

    public getQueryBuilder(): SelectQueryBuilder<WorkerEntity> {
        return this.woerkersRepository.createQueryBuilder('profile');
    }

    public async deleteAll(): Promise<void> {
        await this.woerkersRepository.clear();
        this.logger.log('All employee profiles deleted');
    }
}