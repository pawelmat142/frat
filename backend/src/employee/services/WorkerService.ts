/** Created by Pawel Malek **/
import { ForbiddenException, Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { WorkerRepo } from './WorkerRepo';
import { WorkerEntity } from 'employee/model/WorkerEntity';
import { AvatarRef, UserI } from '@shared/interfaces/UserI';
import { WorkerAvailabilityOptions, WorkerFormDto, WorkerI, WorkerSkills, WorkerStatus, WorkerStatuses, WorkerWithCertificates, WorkerWithMutualFriends } from '@shared/interfaces/WorkerI';
import { ToastException } from 'global/exceptions/ToastException';
import { WorkerUtil } from './WorkerUtil';
import { DeepPartial, In } from 'typeorm';
import { DateRangeUtil } from '@shared/utils/DateRangeUtil';
import { DateUtil } from '@shared/utils/DateUtil';
import { WorkersInitialData } from './WorkersInitialData';
import { Subscription } from 'rxjs';
import { UserService } from 'user/services/UserService';
import { CertificatesWorkerService } from './CertificatesWorkerService';
import { CloudinaryService } from 'user/UserManagement/CloudinaryService';
import { CloudinaryTags } from '@shared/utils/CloudinaryUtil';

@Injectable()
export class WorkersService implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger(this.constructor.name);

    private readonly subscription = new Subscription();

    constructor(
        private readonly workerRepo: WorkerRepo,
        private readonly userService: UserService,
        private readonly certificatesWorkerService: CertificatesWorkerService,
        private readonly cloudinaryService: CloudinaryService,
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
                        // Delete certificates before deleting profile
                        await this.certificatesWorkerService.deleteAllCertificatesForWorker(user.uid);
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

    public async getWorkersByIds(workerIds: number[]): Promise<WorkerI[]> {
        const workers = await this.workerRepo.findAll({ where: { workerId: In(workerIds) } });
        return workers
    }

    public activationByAdmin(id: number, status: WorkerStatus): Promise<WorkerEntity> {
        return this.workerRepo.activation(id, status);
    }

    public async deleteProfile(workerId: number): Promise<void> {
        const profile = await this.workerRepo.getById(workerId);
        if (!profile) {
            throw new NotFoundException("employeeProfile.notFound");
        }
        await this.deleteAllWorkerProfileImages(profile.uid);
        return this.workerRepo.delete(profile);
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

    public getWorkerByUid(uid: string): Promise<WorkerEntity | null> {
        return this.workerRepo.findByUid(uid);
    }

    public getWorker(user: UserI): Promise<WorkerEntity | null> {
        return this.getWorkerByUid(user.uid);
    }

    public getWorkerById(id: number): Promise<WorkerEntity | null> {
        return this.workerRepo.getById(id);
    }

    public async getWorkerWithCertificates(user: UserI): Promise<WorkerWithCertificates | null> {
        const worker = await this.getWorker(user);
        if (!worker) {
            return null;
        }
        const certificates = await this.certificatesWorkerService.getCertificates(user.uid);
        return { ...worker, certs: certificates };
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
        
        // Create certificates with validity dates if provided
        if (Object.keys(form.certificateDates || {}).length) {
            await this.certificatesWorkerService.createCertificates(user.uid, form)
            this.logger.log(`Created certificates for new worker profile: ${result.workerId}`);
        }
        
        await this.userService.updateAvatarIfChanges(user, form.avatarRef);
        return result;
    }

    public async updateWorker(user: UserI, form: WorkerFormDto): Promise<WorkerEntity> {
        const profileBefore = await this.workerRepo.findByUid(user.uid);
        if (!profileBefore) {
            throw new ToastException('employeeProfile.notFound', this);
        }
        
        // Sync certificates before updating profile
        const certificatesChanged = await this.updateCertificatesValidityDates(user.uid, form);
        
        const profile = await this.prepareProfile(user, form);
        const result = await this.workerRepo.update(profile, certificatesChanged); // Mark as changed since certificates might have changed
        await this.userService.updateAvatarIfChanges(user, form.avatarRef);
        return result;
    }

    public async updateSkills(user: UserI, skills: WorkerSkills): Promise<void> {
        const profile = await this.workerRepo.findByUid(user.uid);
        if (!profile) {
            throw new ToastException('employeeProfile.notFound', this);
        }
        profile.skills = skills;
        await this.workerRepo.update(profile);
        this.logger.log(`Updated skills for profile ID: ${profile.workerId}, total skills now: ${profile.skills.items.length}`);
    }

    public async addImage(user: UserI, imageRef: AvatarRef): Promise<void> {
        const profile = await this.workerRepo.findByUid(user.uid);
        if (!profile) {
            throw new ToastException('employeeProfile.notFound', this);
        }
        profile.images = profile.images || [];
        profile.images.push(imageRef);
        await this.workerRepo.update(profile);
        this.logger.log(`Added image for profile ID: ${profile.workerId}, total images now: ${profile.images.length}`);
    }

    public async removeImage(user: UserI, publicId: string): Promise<void> {
        const profile = await this.workerRepo.findByUid(user.uid);
        if (!profile) {
            throw new ToastException('employeeProfile.notFound', this);
        }

        await this.cloudinaryService.deleteImage(publicId);

        profile.images = profile.images || [];
        profile.images = profile.images.filter(image => image.publicId !== publicId);
        await this.workerRepo.update(profile);
        this.logger.log(`Removed image for profile ID: ${profile.workerId}, total images now: ${profile.images.length}`);
    }

    private async deleteAllWorkerProfileImages(uid: string): Promise<void> {
        await this.cloudinaryService.deleteImagesWithTags([CloudinaryTags.uid(uid), CloudinaryTags.WORKER_PROFILE]);
    }

    private async updateCertificatesValidityDates(uid: string, form: WorkerFormDto): Promise<boolean> {
        const result = await this.certificatesWorkerService.syncCertificates(uid, form);
        this.logger.log(`Synced certificates for uid: ${uid}`);
        return result;
    }

    public async notifyWorkerView(workerId: number, user: UserI): Promise<void> {
        const profile = await this.workerRepo.getById(workerId);

        if (profile.uid === user.uid) {
            this.logger.log(`Viewer ${user.uid} viewed own profile, skipping view increment`);
            return;
        }
        if (!profile) {
            throw new ToastException('employeeProfile.exists', this);
        }

        if (profile.views.includes(user.uid)) {
            this.logger.log(`Viewer ${user.uid} viewed profile ${workerId}, skipping view increment`);
        } else {
            this.logger.log(`Viewer ${user.uid} viewed profile ${workerId}, incrementing views`);
            profile?.views.push(user.uid);
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
        
        // Delete certificates before deleting profile
        await this.certificatesWorkerService.deleteAllCertificatesForWorker(user.uid);
        return this.deleteProfile(profile.workerId);
    }

    private async prepareProfile(user: UserI, form: WorkerFormDto): Promise<DeepPartial<WorkerEntity>> {
        const status = this.getProfileStatus(user, form);

        const result: DeepPartial<WorkerEntity> = {
            uid: user.uid,
            status: status,
            displayName: form.fullName,
            fullName: form.fullName,
            phoneNumber: form.phoneNumber,
            email: form.email,
            communicationLanguages: form.communicationLanguages || [],
            avatarRef: form.avatarRef,
            bio: form.bio,

            certificates: form.certificates || [],

            categories: form.categories || [],
            careerStartDate: form.careerStartDate,
            maxAltitude: form.maxAltitude,
            readyToTravel: form.readyToTravel,
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
            result.startDate = DateUtil.toLocalDateString(new Date());
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
