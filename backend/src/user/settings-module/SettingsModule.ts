/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingsEntity } from './model/SettingsEntity';
import { SettingsRepo } from './services/SettingsRepo';
import { SettingsService } from './services/SettingsService';
import { SettingsController } from './SettingsController';
import { AuthModule } from 'auth/AuthModule';

@Module({
    imports: [
        TypeOrmModule.forFeature([SettingsEntity]),
        AuthModule,
    ],
    controllers: [
        SettingsController,
    ],
    providers: [
        SettingsRepo,
        SettingsService,
    ],
    exports: [
        SettingsService,
    ],
})
export class SettingsModule {}
