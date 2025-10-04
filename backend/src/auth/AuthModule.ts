/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { AuthService } from './services/AuthService';
import { AuthController } from './AuthController';
import { FirebaseConfig } from 'config/FirebaseConfig';
import { EmailModule } from 'email/EmailModule';

@Module({
  imports: [
    EmailModule,
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
