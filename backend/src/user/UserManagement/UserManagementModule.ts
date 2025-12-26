/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { AuthModule } from 'auth/AuthModule';
import { UserManagementService } from './UserManagementService';
import { UserModule } from 'user/UserModule';
import { UserManagementController } from './UserManagementController';

@Module({
    imports: [
        UserModule,
        AuthModule
    ],
    providers: [
        UserManagementService
    ],
    controllers: [
        UserManagementController
    ],
})
export class UserManagementModule { }
