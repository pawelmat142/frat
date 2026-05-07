import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TrainingI, TrainingSearchFilters, TrainingSessionI, TrainingSessionStatuses, TrainingStatuses, TrainingWithNextSession } from '@shared/interfaces/TrainingI';
import { UserI } from '@shared/interfaces/UserI';
import { TrainingEntity } from '../model/TrainingEntity';
import { TrainingSessionEntity } from '../model/TrainingSessionEntity';
import { TrainingRepo } from './TrainingRepo';

@Injectable()
export class TrainingService {

    constructor(private readonly trainingRepo: TrainingRepo) {}

    // ─── Trainings ────────────────────────────────────────────────────────────

    async getTrainingById(trainingId: number): Promise<TrainingI> {
        const training = await this.trainingRepo.getTrainingById(trainingId);
        if (!training) throw new NotFoundException('Training not found');
        await this.trainingRepo.incrementUniqueViewsCount(trainingId);
        return training;
    }

    listMyTrainings(user: UserI): Promise<TrainingI[]> {
        return this.trainingRepo.listByUid(user.uid);
    }

    async createTraining(user: UserI, providerId: number, data: Partial<TrainingEntity>): Promise<TrainingI> {
        return this.trainingRepo.createTraining({
            ...data,
            uid: user.uid,
            providerId,
            status: TrainingStatuses.DRAFT,
            uniqueViewsCount: 0,
        });
    }

    async updateTraining(user: UserI, trainingId: number, data: Partial<TrainingEntity>): Promise<TrainingI> {
        const training = await this.getOwnedTraining(user.uid, trainingId);
        // Prevent ownership fields from being overwritten
        const { uid, trainingId: _id, providerId, uniqueViewsCount, ...safeData } = data as any;
        Object.assign(training, safeData);
        return this.trainingRepo.saveTraining(training);
    }

    async toggleActivation(user: UserI, trainingId: number): Promise<TrainingI> {
        const training = await this.getOwnedTraining(user.uid, trainingId);
        training.status = training.status === TrainingStatuses.ACTIVE
            ? TrainingStatuses.INACTIVE
            : TrainingStatuses.ACTIVE;
        return this.trainingRepo.saveTraining(training);
    }

    async deleteTraining(user: UserI, trainingId: number): Promise<void> {
        await this.getOwnedTraining(user.uid, trainingId);
        await this.trainingRepo.deleteAllSessionsForTraining(trainingId);
        await this.trainingRepo.deleteTraining(trainingId);
    }

    // ─── Sessions ─────────────────────────────────────────────────────────────

    async listSessions(trainingId: number): Promise<TrainingSessionI[]> {
        await this.assertTrainingExists(trainingId);
        return this.trainingRepo.listSessionsByTrainingId(trainingId);
    }

    async createSession(user: UserI, trainingId: number, data: Partial<TrainingSessionEntity>): Promise<TrainingSessionI> {
        await this.getOwnedTraining(user.uid, trainingId);
        return this.trainingRepo.createSession({ ...data, trainingId, bookingsCount: 0, status: TrainingSessionStatuses.SCHEDULED });
    }

    async updateSession(user: UserI, trainingId: number, sessionId: number, data: Partial<TrainingSessionEntity>): Promise<TrainingSessionI> {
        await this.getOwnedTraining(user.uid, trainingId);
        const session = await this.getSession(trainingId, sessionId);
        const { sessionId: _sid, trainingId: _tid, bookingsCount, ...safeData } = data as any;
        Object.assign(session, safeData);
        return this.trainingRepo.saveSession(session);
    }

    async deleteSession(user: UserI, trainingId: number, sessionId: number): Promise<void> {
        await this.getOwnedTraining(user.uid, trainingId);
        await this.getSession(trainingId, sessionId);
        await this.trainingRepo.deleteSession(sessionId);
    }

    // ─── Search ───────────────────────────────────────────────────────────────

    async searchTrainings(filters: TrainingSearchFilters): Promise<{ trainings: TrainingWithNextSession[]; count: number }> {
        const { trainings, count } = await this.trainingRepo.searchTrainings(filters);
        if (!trainings.length) return { trainings: [], count };

        const trainingIds = trainings.map(t => t.trainingId);
        const upcomingSessions = await this.trainingRepo.listUpcomingSessionsByTrainingIds(trainingIds);

        // Map the nearest upcoming session to each training
        const nextSessionMap = new Map<number, TrainingSessionEntity>();
        for (const session of upcomingSessions) {
            if (!nextSessionMap.has(session.trainingId)) {
                nextSessionMap.set(session.trainingId, session);
            }
        }

        const result: TrainingWithNextSession[] = trainings.map(t => ({
            ...t,
            nextSession: nextSessionMap.get(t.trainingId),
        }));

        return { trainings: result, count };
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private async getOwnedTraining(uid: string, trainingId: number): Promise<TrainingEntity> {
        const training = await this.trainingRepo.getTrainingById(trainingId);
        if (!training) throw new NotFoundException('Training not found');
        if (training.uid !== uid) throw new ForbiddenException('Access denied');
        return training;
    }

    private async getSession(trainingId: number, sessionId: number): Promise<TrainingSessionEntity> {
        const session = await this.trainingRepo.getSessionById(sessionId);
        if (!session || session.trainingId !== trainingId) throw new NotFoundException('Session not found');
        return session;
    }

    private async assertTrainingExists(trainingId: number): Promise<void> {
        const training = await this.trainingRepo.getTrainingById(trainingId);
        if (!training) throw new NotFoundException('Training not found');
    }
}
