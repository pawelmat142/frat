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

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EmployeeProfileEntity,
        ]),

        AuthModule,
        DictionariesModule,
    ],
    providers: [
        EmployeeProfileRepo,
        EmployeeProfileService,
        GeoPointService
    ],
    controllers: [
        EmployeeProfileController
    ],
    exports: [
    ],
})
export class EmployeeProfileModule { }
