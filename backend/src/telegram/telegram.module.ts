import { Module } from '@nestjs/common';
import { WizardService } from './wizard.service';
import { ServiceProvider } from './wizards/services.provider';
import { UserModule } from 'user/UserModule';
import { AuthModule } from 'auth/AuthModule';

@Module({
  imports: [
    UserModule,
    AuthModule,
  ],
  providers: [
    WizardService,
    ServiceProvider
  ],
  exports: [

  ],
})
export class TelegramModule { }
