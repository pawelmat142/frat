/** Created by Pawel Malek **/
import {
  Controller,
  UseInterceptors,
  Post,
  Body,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { AuthService } from './services/AuthService';
import { LoginFormDto, LoginFormResponse, RegisterFormDto, RegisterFormResponse } from '@shared/dto/AuthDto';

// TODO roles guardy
@Controller('api/auth')
@UseInterceptors(LogInterceptor)
export class AuthController {

  constructor(private readonly authService: AuthService) { }

  @Post('register-form')
  registerForm(@Body() dto: RegisterFormDto): Promise<RegisterFormResponse> {
    return this.authService.registerForm(dto);
  }

  @Post('login-form')
  loginForm(@Body() dto: LoginFormDto): Promise<LoginFormResponse> {
    return this.authService.loginForm(dto);
  } 

}
