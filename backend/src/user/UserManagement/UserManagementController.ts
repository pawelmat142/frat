/** Created by Pawel Malek **/
import {
  Body,
  Controller,
  Delete,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { AvatarRef, UserI } from '@shared/interfaces/UserI';
import { Serialize } from 'global/decorators/Serialize';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { UserManagementService } from './UserManagementService';
import { UserEntity } from 'user/model/UserEntity';

@Controller('api/user-management')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard)
export class UserManagementController {

  constructor(
    private readonly userManagementService: UserManagementService,
  ) { }

  @Put('/avatar')
  @Serialize(UserEntity)
  @UseGuards(JwtAuthGuard)
  updateAvatar(
    @CurrentUser() user: UserI,
    @Body() avatarRef?: AvatarRef
  ): Promise<UserI> {
    return this.userManagementService.updateAvatar(user, avatarRef);
  }


  @Delete('/delete-account')
  @UseGuards(JwtAuthGuard)
  deleteAccount(@CurrentUser() user: UserI): Promise<boolean> {
    return this.userManagementService.deleteAccount(user);
  }

}
