/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { UsersAdminController } from './UsersAdminController';
import { UsersAdminService } from './UsersAdminService';
import { UserModule } from 'user/UserModule';

@Module({
  imports: [
    UserModule
  ],
  controllers: [
    UsersAdminController
  ],
  providers: [
    UsersAdminService,
  ],
  exports: [
  ],
})
export class UsersAdminModule { }
