/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { AuthService } from './services/AuthService';
import { AuthController } from './AuthController';
import { EmailModule } from 'email/EmailModule';
import { FirebaseConfig } from './services/FirebaseConfig';
import { UserModule } from 'user/UserModule';

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
    FirebaseConfig
  ],
  exports: [
  ],
})
export class AuthModule {}
