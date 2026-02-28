/** Created by Pawel Malek **/
import { Body, Controller, Get, Patch, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserI } from '@shared/interfaces/UserI';
import { SettingsI } from '@shared/interfaces/SettingsI';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { SettingsService } from './services/SettingsService';

@Controller('api/settings')
@UseInterceptors(LogInterceptor)
@UseGuards(JwtAuthGuard)
export class SettingsController {

    constructor(
        private readonly settingsService: SettingsService,
    ) {}

    @Get()
    getSettings(@CurrentUser() user: UserI): Promise<SettingsI> {
        return this.settingsService.getSettings(user.uid);
    }

    @Patch()
    updateSettings(
        @CurrentUser() user: UserI,
        @Body() body: SettingsI,
    ): Promise<SettingsI> {
        return this.settingsService.updateSettings(user.uid, body);
    }
}
