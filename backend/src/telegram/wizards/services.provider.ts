import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { ExportedAuthService } from 'auth/services/ExportedAuthService';
import { TelegramUserService } from 'user/services/TelegramUserService';

@Injectable()
export class ServiceProvider {
  constructor(
    readonly telegramUserService: TelegramUserService,
    readonly exportedAuthService: ExportedAuthService,
    readonly configService: ConfigService,
  ) {}
}
