/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { EmployeeProfileEntity } from './model/EmployeeProfileEntity';
import { EmployeeProfileRepo } from './services/EmployeeProfileRepo';
import { EmployeeProfileService } from './services/EmployeeProfileService';
import { EmployeeProfileController } from './EmployeeProfileController';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EmployeeProfileEntity,
        ]),
    ],
    providers: [
        EmployeeProfileRepo,
        EmployeeProfileService
    ],
    controllers: [
        EmployeeProfileController
    ],
    exports: [
    ],
})
export class EmployeeProfileModule { }
