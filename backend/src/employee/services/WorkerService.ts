/** Created by Pawel Malek **/
import { ForbiddenException, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WorkerRepo } from './WorkerRepo';
import { WorkerEntity } from 'employee/model/WorkerEntity';
import { UserI } from '@shared/interfaces/UserI';
import { WorkerAvailabilityOptions, WorkerFormDto, WorkerI, WorkerStatus, WorkerStatuses } from '@shared/interfaces/WorkerProfileI';
import { ToastException } from 'global/exceptions/ToastException';
import { WorkerUtil } from './WorkerUtil';
import { DeepPartial } from 'typeorm';
import { DateRangeUtil } from '@shared/utils/DateRangeUtil';
import { WorkersInitialData } from './WorkersInitialData';
import { Subscription } from 'rxjs';
import { UserService } from 'user/services/UserService';

@Injectable()
export class WorkersService implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger(this.constructor.name);

    private readonly subscription = new Subscription();

    constructor(
        private readonly workerRepo: WorkerRepo,
        private readonly userService: UserService,
    ) { }

    onModuleInit() {
        this.startSubscription();
    }

    onModuleDestroy() {
        this.subscription.unsubscribe();
    }

    private startSubscription() {
        this.subscription.add(
            this.userService.userDeletedEvent.subscribe(async (user) => {
                if (user) {
                    const profile = await this.getWorker(user);
                    if (profile) {
                        await this.deleteProfile(profile.workerId);
                    } else {
                        this.logger.log(`No employee profile found for deleted user UID: ${user.uid}`);
                    }
                }
            })
        );
    }

    public listProfiles(): Promise<WorkerEntity[]> {
        return this.workerRepo.findAll();
    }

    public async activation(user: UserI): Promise<WorkerEntity> {
        const profile = await this.workerRepo.findByUid(user.uid);
        if (!profile) {
            throw new ToastException('employeeProfile.notFound', this);
        }
        if (profile.uid !== user.uid) {
            throw new ForbiddenException()
        }
        profile.status = WorkerStatuses.ACTIVE === profile.status ? WorkerStatuses.INACTIVE : WorkerStatuses.ACTIVE;
        const result = await this.workerRepo.update(profile);
        this.logger.log(`Toggled activation for profile ID: ${profile.workerId}, new status: ${result.status}`);
        return result;
    }

    public activationByAdmin(id: number, status: WorkerStatus): Promise<WorkerEntity> {
        return this.workerRepo.activation(id, status);
    }

    public deleteProfile(workerId: number): Promise<void> {
        return this.workerRepo.delete(workerId);
    }

    public deleteAllProfiles(): Promise<void> {
        return this.workerRepo.deleteAllProfiles();
    }

    public async initialLoad(): Promise<void> {
        try {
            const profiles = WorkersInitialData()

            return await this.workerRepo.initialLoad(profiles as WorkerI[]);
        } catch (e) {
            console.error(e)
            throw new ToastException("Initial load failed", this);
        }
    }

    public getWorker(user: UserI): Promise<WorkerEntity | null> {
        return this.workerRepo.findByUid(user.uid);
    }

    public fetchWorkerByDisplayName(displayName: string): Promise<WorkerEntity | null> {
        return this.workerRepo.findByDisplayName(displayName);
    }

    public async createWorker(user: UserI, form: WorkerFormDto): Promise<WorkerEntity> {
        const exists = await this.workerRepo.findByUid(user.uid);
        if (exists) {
            throw new ToastException('employeeProfile.exists', this);
        }

        const profile = await this.prepareProfile(user, form);
        const result = await this.workerRepo.create(profile);
        return result;
    }

    public async updateWorker(user: UserI, form: WorkerFormDto): Promise<WorkerEntity> {
        const profile = await this.prepareProfile(user, form);
        return this.workerRepo.update(profile);
    }

    public async notifyWorkerView(uid: string, viewerUid: string): Promise<void> {
        const profile = await this.workerRepo.findByUid(uid);
        if (uid === viewerUid) {
            this.logger.log(`Viewer ${viewerUid} viewed own profile, skipping view increment`);
            return;
        }
        if (!profile) {
            throw new ToastException('employeeProfile.exists', this);
        }

        if (profile.views.includes(viewerUid)) {
            this.logger.log(`Viewer ${viewerUid} viewed profile ${uid}, skipping view increment`);
        } else {
            this.logger.log(`Viewer ${viewerUid} viewed profile ${uid}, incrementing views`);
            profile?.views.push(viewerUid);
            await this.workerRepo.update(profile);
        }
    }
    
    public async notifyWorkerLike(workerId: number, likerUid: string): Promise<string[]> {
        const profile = await this.workerRepo.getById(workerId);
        if (!profile) {
            throw new ToastException('employeeProfile.exists', this);
        }
        if (profile.uid === likerUid) {
            throw new ToastException('employeeProfile.cannotLikeOwnProfile', this);
        }
        if (profile.likes.includes(likerUid)) {
            profile.likes = profile.likes.filter(uid => uid !== likerUid);
            await this.workerRepo.update(profile);
            this.logger.log(`Liker ${likerUid} unliked profile ${workerId}`);
        } else {
            profile?.likes.push(likerUid);
            await this.workerRepo.update(profile);
            this.logger.log(`Liker ${likerUid} liked profile ${workerId}`);
        }
        return profile.likes;
    }

    async deleteProfileByUid(user: UserI): Promise<void> {
        const profile = await this.workerRepo.findByUid(user.uid);
        if (!profile) {
            throw new ToastException('employeeProfile.notFound', this);
        }
        return this.deleteProfile(profile.workerId);
    }

    // TODO update user avatar upon profile update
    private async prepareProfile(user: UserI, form: WorkerFormDto): Promise<DeepPartial<WorkerEntity>> {
        const status = this.getProfileStatus(user, form);

        const result: DeepPartial<WorkerEntity> = {
            uid: user.uid,
            status: status,
            displayName: form.fullName,
            fullName: form.fullName,
            phoneNumber: form.phoneNumber,
            email: user.email,
            communicationLanguages: form.communicationLanguages || [],
            avatarRef: user.avatarRef,
            bio: form.bio,
            experience: form.experience || [],
            certificates: form.certificates || [],
        };

        this.fillLocationData(result, form);
        this.fillAvailabilityData(result, form);

        WorkerUtil.validateProfile(result);
        return result;
    }

    private fillAvailabilityData(result: DeepPartial<WorkerEntity>, form: WorkerFormDto): void {
        result.availabilityOption = form.availabilityOption;
        if (result.availabilityOption === WorkerAvailabilityOptions.DATE_RANGES) {
            const ranges = form.availabilityDateRanges.map(dateRange => DateRangeUtil.fromDateRange([], dateRange))
            result.availabilityDateRanges = ranges
            result.startDate = DateRangeUtil.findEarliestDate(ranges)
            result.rangesOption = form.rangesOption;
        } 
        else {
            result.rangesOption = undefined;
            result.availabilityDateRanges = undefined;
        }
        if (result.availabilityOption === WorkerAvailabilityOptions.FROM_DATE) {
            result.startDate = form.startDate
        }
        if (result.availabilityOption === WorkerAvailabilityOptions.ANYTIME) {
            result.startDate = new Date();
        }
    }

    private fillLocationData(result: DeepPartial<WorkerEntity>, form: WorkerFormDto): void {
        WorkerUtil.fillLocationData(result, form)
    }

    private getProfileStatus(user: UserI, form: WorkerFormDto): WorkerStatus {
        // TODO
        return WorkerStatuses.ACTIVE;
    }

}
