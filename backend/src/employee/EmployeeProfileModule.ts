/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { EmployeeProfileEntity } from './model/EmployeeProfileEntity';
import { EmployeeProfileRepo } from './services/EmployeeProfileRepo';
import { EmployeeProfileService } from './services/EmployeeProfileService';
import { EmployeeProfileController } from './EmployeeProfileController';
import { AuthModule } from 'auth/AuthModule';
import { DictionariesModule } from 'admin/dictionaries/DictionariesModule';
import { GeoPointService } from './services/GeoPointService';
import { SearchEmployeeProfileService } from './services/SearchEmployeeProfileService';
import { DateRangeEntity } from './model/DateRangeEntity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EmployeeProfileEntity,
            DateRangeEntity
        ]),

        AuthModule,
        DictionariesModule,
    ],
    providers: [
        EmployeeProfileRepo,
        EmployeeProfileService,
        SearchEmployeeProfileService,
        GeoPointService
    ],
    controllers: [
        EmployeeProfileController
    ],
    exports: [
    ],
})
export class EmployeeProfileModule { }
