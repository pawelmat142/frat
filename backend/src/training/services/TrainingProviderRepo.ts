import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingProviderProfileI } from '@shared/interfaces/TrainingI';
import { DeepPartial, Repository } from 'typeorm';
import { TrainingProviderEntity } from '../model/TrainingProviderEntity';

@Injectable()
export class TrainingProviderRepo {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(TrainingProviderEntity)
        private readonly repo: Repository<TrainingProviderEntity>,
    ) {}

    getByUid(uid: string): Promise<TrainingProviderEntity | null> {
        return this.repo.findOneBy({ uid });
    }

    getById(providerId: number): Promise<TrainingProviderEntity | null> {
        return this.repo.findOneBy({ providerId });
    }

    async create(data: DeepPartial<TrainingProviderEntity>): Promise<TrainingProviderEntity> {
        const entity = this.repo.create(data);
        const saved = await this.repo.save(entity);
        this.logger.log(`Created training provider: ${saved.providerId} for uid: ${saved.uid}`);
        return saved;
    }

    save(entity: TrainingProviderProfileI): Promise<TrainingProviderEntity> {
        return this.repo.save(entity as TrainingProviderEntity);
    }
}
