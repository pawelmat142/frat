/** Created by Pawel Malek **/
import {
  Controller,
  UseInterceptors,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { UserService } from './services/UserService';

@Controller('api/user')
@UseInterceptors(LogInterceptor)
export class UserController {
  
  // TODO
  constructor(private readonly userService: UserService) { }
  
}
