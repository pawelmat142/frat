import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingSearchFilters } from '@shared/interfaces/TrainingI';
import { DeepPartial, Repository, SelectQueryBuilder } from 'typeorm';
import { TrainingEntity } from '../model/TrainingEntity';
import { TrainingSessionEntity } from '../model/TrainingSessionEntity';

@Injectable()
export class TrainingRepo {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(TrainingEntity)
        private readonly trainingRepo: Repository<TrainingEntity>,
        @InjectRepository(TrainingSessionEntity)
        private readonly sessionRepo: Repository<TrainingSessionEntity>,
    ) {}

    // ─── Trainings ────────────────────────────────────────────────────────────

    getTrainingById(trainingId: number): Promise<TrainingEntity | null> {
        return this.trainingRepo.findOneBy({ trainingId });
    }

    listByUid(uid: string): Promise<TrainingEntity[]> {
        return this.trainingRepo.find({ where: { uid }, order: { createdAt: 'DESC' } });
    }

    listByProviderId(providerId: number): Promise<TrainingEntity[]> {
        return this.trainingRepo.find({ where: { providerId }, order: { createdAt: 'DESC' } });
    }

    async createTraining(data: DeepPartial<TrainingEntity>): Promise<TrainingEntity> {
        const entity = this.trainingRepo.create(data);
        const saved = await this.trainingRepo.save(entity);
        this.logger.log(`Created training: ${saved.trainingId}`);
        return saved;
    }

    saveTraining(entity: TrainingEntity): Promise<TrainingEntity> {
        return this.trainingRepo.save(entity);
    }

    async deleteTraining(trainingId: number): Promise<void> {
        await this.trainingRepo.delete(trainingId);
    }

    getTrainingQueryBuilder(): SelectQueryBuilder<TrainingEntity> {
        return this.trainingRepo.createQueryBuilder('training');
    }

    incrementUniqueViewsCount(trainingId: number): Promise<void> {
        return this.trainingRepo
            .createQueryBuilder()
            .update(TrainingEntity)
            .set({ uniqueViewsCount: () => 'unique_views_count + 1' })
            .where('training_id = :trainingId', { trainingId })
            .execute()
            .then(() => undefined);
    }

    // ─── Sessions ─────────────────────────────────────────────────────────────

    getSessionById(sessionId: number): Promise<TrainingSessionEntity | null> {
        return this.sessionRepo.findOneBy({ sessionId });
    }

    listSessionsByTrainingId(trainingId: number): Promise<TrainingSessionEntity[]> {
        return this.sessionRepo.find({
            where: { trainingId },
            order: { startDate: 'ASC' },
        });
    }

    getNextSessionForTraining(trainingId: number): Promise<TrainingSessionEntity | null> {
        return this.sessionRepo
            .createQueryBuilder('session')
            .where('session.training_id = :trainingId', { trainingId })
            .andWhere("session.status = 'SCHEDULED'")
            .andWhere('session.start_date >= NOW()')
            .orderBy('session.start_date', 'ASC')
            .getOne();
    }

    async createSession(data: DeepPartial<TrainingSessionEntity>): Promise<TrainingSessionEntity> {
        const entity = this.sessionRepo.create(data);
        const saved = await this.sessionRepo.save(entity);
        this.logger.log(`Created session: ${saved.sessionId} for training: ${saved.trainingId}`);
        return saved;
    }

    saveSession(entity: TrainingSessionEntity): Promise<TrainingSessionEntity> {
        return this.sessionRepo.save(entity);
    }

    async deleteSession(sessionId: number): Promise<void> {
        await this.sessionRepo.delete(sessionId);
    }

    async deleteAllSessionsForTraining(trainingId: number): Promise<void> {
        await this.sessionRepo.delete({ trainingId });
    }

    listUpcomingSessionsByTrainingIds(trainingIds: number[]): Promise<TrainingSessionEntity[]> {
        if (!trainingIds.length) return Promise.resolve([]);
        return this.sessionRepo
            .createQueryBuilder('session')
            .where('session.training_id IN (:...trainingIds)', { trainingIds })
            .andWhere("session.status = 'SCHEDULED'")
            .andWhere('session.start_date >= NOW()')
            .orderBy('session.start_date', 'ASC')
            .getMany();
    }

    // ─── Search ───────────────────────────────────────────────────────────────

    async searchTrainings(filters: TrainingSearchFilters): Promise<{ trainings: TrainingEntity[]; count: number }> {
        const qb = this.trainingRepo
            .createQueryBuilder('training')
            .where("training.status = 'ACTIVE'");

        if (filters.certificateCode) {
            qb.andWhere('training.certificate_code = :certificateCode', { certificateCode: filters.certificateCode });
        }

        if (filters.locationCountry) {
            qb.andWhere('training.location_country = :locationCountry', { locationCountry: filters.locationCountry });
        }

        if (filters.languages?.length) {
            qb.andWhere('training.languages && :languages', { languages: filters.languages });
        }

        if (filters.lat != null && filters.lng != null && filters.radiusKm != null) {
            // ST_DWithin works with geography in meters
            qb.andWhere(
                `ST_DWithin(training.point, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :radiusM)`,
                { lat: filters.lat, lng: filters.lng, radiusM: filters.radiusKm * 1000 },
            );
        }

        const [trainings, count] = await qb
            .orderBy('training.created_at', 'DESC')
            .skip(filters.skip)
            .take(filters.limit)
            .getManyAndCount();

        return { trainings, count };
    }
}
