/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { AuthService } from './services/AuthService';
import { AuthController } from './AuthController';
import { EmailModule } from 'email/EmailModule';
import { FirebaseConfig } from './services/FirebaseConfig';
import { UserModule } from 'user/UserModule';
import { JwtAuthGuard } from './guards/JwtAuthGuard';
import { RolesGuard } from './guards/RolesGuard';
import { ExportedAuthService } from './services/ExportedAuthService';

@Module({
  imports: [
    EmailModule,
    UserModule
  ],
  controllers: [
    AuthController
  ],
  providers: [
    AuthService,
    FirebaseConfig,
    JwtAuthGuard,
    RolesGuard,
    ExportedAuthService
  ],
  exports: [
    ExportedAuthService,
  ],  
})
export class AuthModule {}
