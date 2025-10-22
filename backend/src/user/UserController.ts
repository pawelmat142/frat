/** Created by Pawel Malek **/
import {
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { UserPublicService } from './services/UserPublicService';
import { Public } from 'auth/decorators/PublicDecorator';
import { UserI } from '@shared/interfaces/UserI';
import { Serialize } from 'global/decorators/Serialize';
import { UserEntity } from './model/UserEntity';

@Controller('api/user')
@UseInterceptors(LogInterceptor)
export class UserController {
  
  constructor(private readonly userPublicService: UserPublicService) { }

  @Get('/:uid')
  @Public()
  @Serialize(UserEntity)
  fetchUser(uid: string): Promise<UserI> {
    return this.userPublicService.fetchUser(uid);
  }
  
}
