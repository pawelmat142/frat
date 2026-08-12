/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { UsersAdminController } from './UsersAdminController';
import { UsersAdminService } from './UsersAdminService';
import { UserModule } from 'user/UserModule';
import { AuthModule } from 'auth/AuthModule';
import { SuperAdminController } from './SuperAdminController';
import { UserManagementModule } from 'user/UserManagement/UserManagementModule';

@Module({
  imports: [
    UserModule,
    AuthModule,
    UserManagementModule,
  ],
  controllers: [
    UsersAdminController,
    SuperAdminController
  ],
  providers: [
    UsersAdminService,
  ],
  exports: [
  ],
})
export class UsersAdminModule { }
