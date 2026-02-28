/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { WorkerEntity } from './model/WorkerEntity';
import { WorkerRepo } from './services/WorkerRepo';
import { WorkersService } from './services/WorkerService';
import { WorkersController } from './WorkersController';
import { AuthModule } from 'auth/AuthModule';
import { DictionariesModule } from 'admin/dictionaries/DictionariesModule';
import { GeoPointService } from './services/GeoPointService';
import { SearchWorkersService } from './services/SearchWorkerService';
import { DateRangeEntity } from './model/DateRangeEntity';
import { UserModule } from 'user/UserModule';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            WorkerEntity,
            DateRangeEntity
        ]),

        AuthModule,
        DictionariesModule,
        UserModule
    ],
    providers: [
        WorkerRepo,
        WorkersService,
        SearchWorkersService,
        GeoPointService
    ],
    controllers: [
        WorkersController
    ],
    exports: [
        WorkersService
    ],
})
export class WorkerModule { }
