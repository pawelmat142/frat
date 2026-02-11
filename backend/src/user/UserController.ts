/** Created by Pawel Malek **/
import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { UserPublicService } from './services/UserPublicService';
import { Public } from 'auth/decorators/PublicDecorator';
import { UserI, UserSearchResponse } from '@shared/interfaces/UserI';
import { Serialize } from 'global/decorators/Serialize';
import { UserEntity } from './model/UserEntity';

@Controller('api/user')
@UseInterceptors(LogInterceptor)
export class UserController {

  constructor(
    private readonly userPublicService: UserPublicService,
  ) { }

  @Get('/search')
  @Public()
  searchUsers(
    @Query('query') query: string,
    @Query('skip') skip?: string,
    @Query('limit') limit?: string,
  ): Promise<UserSearchResponse> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters');
    }
    const parsedSkip = Math.max(Number(skip) || 0, 0);
    const parsedLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
    return this.userPublicService.searchUsers(query.trim(), parsedSkip, parsedLimit);
  }

  @Get('/:uid')
  @Public()
  @Serialize(UserEntity)
  fetchUser(@Param('uid') uid: string): Promise<UserI> {
    return this.userPublicService.fetchUser(uid);
  }
}
