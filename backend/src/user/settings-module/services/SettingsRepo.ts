/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsEntity } from '../model/SettingsEntity';
import { SettingsI } from '@shared/interfaces/SettingsI';

@Injectable()
export class SettingsRepo {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(SettingsEntity)
        private readonly repository: Repository<SettingsEntity>,
    ) {}

    public async getByUid(uid: string): Promise<SettingsEntity | null> {
        return this.repository.findOneBy({ uid });
    }

    public async upsert(uid: string, settings: SettingsI): Promise<SettingsEntity> {
        const existing = await this.repository.findOneBy({ uid });

        if (existing) {
            Object.assign(existing, settings);
            return this.repository.save(existing);
        }

        settings.uid = uid;
        const entity = this.repository.create(settings);
        const saved = await this.repository.save(entity);
        this.logger.log(`Created settings for user: ${uid}`);
        return saved;
    }
}
