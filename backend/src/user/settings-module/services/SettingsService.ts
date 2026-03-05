/** Created by Pawel Malek **/
import { Injectable } from '@nestjs/common';
import { SettingsRepo } from './SettingsRepo';
import { SettingsI, defaultSettings } from '@shared/interfaces/SettingsI';

@Injectable()
export class SettingsService {

    constructor(
        private readonly settingsRepo: SettingsRepo,
    ) {}

    public async getSettings(uid: string): Promise<SettingsI> {
        const entity = await this.settingsRepo.getByUid(uid);
        if (!entity) {
            return { ...defaultSettings, uid };
        }
        return {
            uid: entity.uid,
            theme: entity.theme,
            languageCode: entity.languageCode,
        };
    }

    public async updateSettings(uid: string, settings: SettingsI): Promise<SettingsI> {
        const entity = await this.settingsRepo.upsert(uid, settings);
        return entity;
    }
}
