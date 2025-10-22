/** Created by Pawel Malek **/
import {
  Controller,
  UseInterceptors,
  UseGuards,
  Post,
  Get,
  Body,
  Param,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { AuthService } from './services/AuthService';
import { RegisterFormDto } from '@shared/dto/AuthDto';
import { JwtAuthGuard } from './guards/JwtAuthGuard';
import { CurrentUser } from './decorators/CurrentUserDecorator';
import { UserI } from '@shared/interfaces/UserI';
import { Public } from './decorators/PublicDecorator';

@Controller('api/auth')
@UseInterceptors(LogInterceptor)
export class AuthController {

  constructor(private readonly authService: AuthService) { }
  
  @Get('login')
  @UseGuards(JwtAuthGuard)
  login(@CurrentUser() user: UserI): UserI {
    return user;
  }
  
  @Get('send-verification-email')
  @UseGuards(JwtAuthGuard)
  sendVerificationEmail(@CurrentUser() user: UserI): Promise<void> {
    return this.authService.sendVerificationEmail(user.email, user.uid);
  }

  @Post('register-form')
  @Public()
  registerForm(@Body() dto: RegisterFormDto): Promise<void> {
    return this.authService.registerForm(dto);
  }

  @Get('send-password-reset-email/:email')
  @Public()
  sendPasswordResetEmail(@Param('email') email: string): Promise<void> {
    return this.authService.sendPasswordResetEmail(email);
  }

}
