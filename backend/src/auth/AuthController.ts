/** Created by Pawel Malek **/
import {
  Controller,
  UseInterceptors,
  UseGuards,
  Post,
  Get,
  Body,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { AuthService } from './services/AuthService';
import { RegisterFormDto, RegisterFormResponse } from '@shared/dto/AuthDto';
import { JwtAuthGuard } from './guards/JwtAuthGuard';
import { CurrentUser } from './decorators/CurrentUserDecorator';
import { UserI } from '@shared/interfaces/UserI';
import { Public } from './decorators/PublicDecorator';

@Controller('api/auth')
@UseInterceptors(LogInterceptor)
export class AuthController {

  constructor(private readonly authService: AuthService) { }
  
  // TODO nie zwracaj pol jakich nie ma w interface UserI
  @Get('login')
  @UseGuards(JwtAuthGuard)
  login(@CurrentUser() user: UserI): UserI {
    console.log('user in login endpoint', user);
    return user;
  }

  @Post('register-form')
  @Public()
  registerForm(@Body() dto: RegisterFormDto): Promise<RegisterFormResponse> {
    return this.authService.registerForm(dto);
  }

  // EXAMPLE PROTECTED ENDPOINT
  
    // @Get('admin-only')
    // @UseGuards(JwtAuthGuard, RolesGuard)
    // @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
    // adminOnly(@CurrentUser() user: UserI) {
    //   return {
    //     message: 'This endpoint is for admins only',
    //     user: user.displayName,
    //     roles: user.roles,
    //   };
    // }

}
