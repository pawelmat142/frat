import { Body, Controller, Delete, Get, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { ProviderFormData } from '@shared/interfaces/TrainingI';

@Controller('api/training-providers')
@UseInterceptors(LogInterceptor)
export class TrainingProviderController {

    constructor(private readonly providerService: TrainingProviderService) {}

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
        @Body() body: ProviderFormData,
    ) {
        return this.providerService.createProfile(user, body);
    }

    @Patch('me')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    @Serialize(TrainingProviderEntity)
    updateProfile(
        @CurrentUser() user: UserI,
        @Body() body: ProviderFormData,
    ) {
        return this.providerService.updateProfile(user, body);
    }

    @Delete()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    deleteProfile(@CurrentUser() user: UserI) {
        return this.providerService.deleteProfile(user);
    }
}
