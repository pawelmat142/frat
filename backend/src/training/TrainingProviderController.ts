import { Body, Controller, Get, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { Roles } from 'auth/decorators/RolesDecorator';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { RolesGuard } from 'auth/guards/RolesGuard';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { Serialize } from 'global/decorators/Serialize';
import { UserI, UserRoles } from '@shared/interfaces/UserI';
import { Param } from '@nestjs/common';
import { TrainingProviderEntity } from './model/TrainingProviderEntity';
import { TrainingProviderService } from './services/TrainingProviderService';

@Controller('api/training-providers')
@UseInterceptors(LogInterceptor)
export class TrainingProviderController {

    constructor(private readonly providerService: TrainingProviderService) {}

    @Get('me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    @Serialize(TrainingProviderEntity)
    getMyProfile(@CurrentUser() user: UserI) {
        return this.providerService.getMyProfile(user);
    }

    @Get(':providerId')
    @Serialize(TrainingProviderEntity)
    getProfileById(@Param('providerId') providerId: number) {
        return this.providerService.getProfileById(providerId);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    @Serialize(TrainingProviderEntity)
    createProfile(
        @CurrentUser() user: UserI,
        @Body() body: Partial<TrainingProviderEntity>,
    ) {
        return this.providerService.createProfile(user, body);
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    @Serialize(TrainingProviderEntity)
    updateProfile(
        @CurrentUser() user: UserI,
        @Body() body: Partial<TrainingProviderEntity>,
    ) {
        return this.providerService.updateProfile(user, body);
    }
}
