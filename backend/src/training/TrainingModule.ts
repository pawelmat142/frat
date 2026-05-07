import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { AuthModule } from 'auth/AuthModule';
import { TrainingProviderEntity } from './model/TrainingProviderEntity';
import { TrainingEntity } from './model/TrainingEntity';
import { TrainingSessionEntity } from './model/TrainingSessionEntity';
import { TrainingProviderRepo } from './services/TrainingProviderRepo';
import { TrainingRepo } from './services/TrainingRepo';
import { TrainingProviderService } from './services/TrainingProviderService';
import { TrainingService } from './services/TrainingService';
import { TrainingController } from './TrainingController';
import { TrainingProviderController } from './TrainingProviderController';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            TrainingProviderEntity,
            TrainingEntity,
            TrainingSessionEntity,
        ]),
        AuthModule,
    ],
    providers: [
        TrainingProviderRepo,
        TrainingRepo,
        TrainingProviderService,
        TrainingService,
    ],
    controllers: [
        TrainingController,
        TrainingProviderController,
    ],
    exports: [
        TrainingService,
        TrainingProviderService,
    ],
})
export class TrainingModule {}
