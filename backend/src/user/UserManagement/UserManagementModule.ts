/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { AuthModule } from 'auth/AuthModule';
import { UserManagementService } from './UserManagementService';
import { UserModule } from 'user/UserModule';
import { UserManagementController } from './UserManagementController';
import { CloudinaryService } from 'user/UserManagement/CloudinaryService';

@Module({
    imports: [
        UserModule,
        AuthModule
    ],
    providers: [
        UserManagementService,
        CloudinaryService,
    ],
    controllers: [
        UserManagementController
    ],
    exports: [
        CloudinaryService,
    ]
})
export class UserManagementModule { }
