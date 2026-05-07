import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { TrainingProviderProfileI, TrainingProviderStatuses } from '@shared/interfaces/TrainingI';
import { UserI } from '@shared/interfaces/UserI';
import { TrainingProviderEntity } from '../model/TrainingProviderEntity';
import { TrainingProviderRepo } from './TrainingProviderRepo';

@Injectable()
export class TrainingProviderService {

    constructor(private readonly providerRepo: TrainingProviderRepo) {}

    async getMyProfile(user: UserI): Promise<TrainingProviderProfileI | null> {
        return this.providerRepo.getByUid(user.uid);
    }

    async getProfileById(providerId: number): Promise<TrainingProviderProfileI> {
        const profile = await this.providerRepo.getById(providerId);
        if (!profile) throw new NotFoundException('Training provider profile not found');
        return profile;
    }

    async createProfile(user: UserI, data: Partial<TrainingProviderEntity>): Promise<TrainingProviderProfileI> {
        const existing = await this.providerRepo.getByUid(user.uid);
        if (existing) throw new ConflictException('Training provider profile already exists for this user');

        return this.providerRepo.create({ ...data, uid: user.uid, status: TrainingProviderStatuses.ACTIVE });
    }

    async updateProfile(user: UserI, data: Partial<TrainingProviderEntity>): Promise<TrainingProviderProfileI> {
        const profile = await this.providerRepo.getByUid(user.uid);
        if (!profile) throw new NotFoundException('Training provider profile not found');

        // Prevent uid / providerId from being overwritten
        const { uid, providerId, ...safeData } = data as any;
        Object.assign(profile, safeData);
        return this.providerRepo.save(profile);
    }

    async getOrThrowOwned(uid: string, providerId: number): Promise<TrainingProviderEntity> {
        const profile = await this.providerRepo.getByUid(uid);
        if (!profile || profile.providerId !== providerId) {
            throw new NotFoundException('Training provider profile not found');
        }
        return profile;
    }
}
