import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { Roles } from 'auth/decorators/RolesDecorator';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { RolesGuard } from 'auth/guards/RolesGuard';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { Serialize } from 'global/decorators/Serialize';
import { UserI, UserRoles } from '@shared/interfaces/UserI';
import { TrainingProviderEntity } from './model/TrainingProviderEntity';
import { TrainingProviderService } from './services/TrainingProviderService';
import { TrainingService } from './services/TrainingService';
import { TrainingEntity } from './model/TrainingEntity';
import { TrainingSessionEntity } from './model/TrainingSessionEntity';
import { TrainingSearchFilters } from '@shared/interfaces/TrainingI';

@Controller('api/trainings')
@UseInterceptors(LogInterceptor)
export class TrainingController {

    constructor(
        private readonly trainingService: TrainingService,
        private readonly providerService: TrainingProviderService,
    ) {}

    // ─── Public endpoints ─────────────────────────────────────────────────────

    @Get('search')
    searchTrainings(@Query() filters: TrainingSearchFilters) {
        const parsed: TrainingSearchFilters = {
            ...filters,
            skip: Number(filters.skip) || 0,
            limit: Math.min(Number(filters.limit) || 20, 100),
            lat: filters.lat != null ? Number(filters.lat) : undefined,
            lng: filters.lng != null ? Number(filters.lng) : undefined,
            radiusKm: filters.radiusKm != null ? Number(filters.radiusKm) : undefined,
        };
        return this.trainingService.searchTrainings(parsed);
    }

    @Get(':trainingId')
    @Serialize(TrainingEntity)
    getTrainingById(@Param('trainingId') trainingId: number) {
        return this.trainingService.getTrainingById(trainingId);
    }

    @Get(':trainingId/sessions')
    @Serialize(TrainingSessionEntity)
    listSessions(@Param('trainingId') trainingId: number) {
        return this.trainingService.listSessions(trainingId);
    }

    // ─── TRAINING_PROVIDER endpoints ──────────────────────────────────────────

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    @Serialize(TrainingEntity)
    listMyTrainings(@CurrentUser() user: UserI) {
        return this.trainingService.listMyTrainings(user);
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    @Serialize(TrainingEntity)
    async createTraining(
        @CurrentUser() user: UserI,
        @Body() body: Partial<TrainingEntity> & { providerId: number },
    ) {
        const { providerId, ...data } = body;
        return this.trainingService.createTraining(user, providerId, data);
    }

    @Patch(':trainingId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    @Serialize(TrainingEntity)
    updateTraining(
        @CurrentUser() user: UserI,
        @Param('trainingId') trainingId: number,
        @Body() body: Partial<TrainingEntity>,
    ) {
        return this.trainingService.updateTraining(user, trainingId, body);
    }

    @Patch(':trainingId/activation')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    @Serialize(TrainingEntity)
    toggleActivation(
        @CurrentUser() user: UserI,
        @Param('trainingId') trainingId: number,
    ) {
        return this.trainingService.toggleActivation(user, trainingId);
    }

    @Delete(':trainingId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    deleteTraining(
        @CurrentUser() user: UserI,
        @Param('trainingId') trainingId: number,
    ) {
        return this.trainingService.deleteTraining(user, trainingId);
    }

    // ─── Session management ───────────────────────────────────────────────────

    @Post(':trainingId/sessions')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    @Serialize(TrainingSessionEntity)
    createSession(
        @CurrentUser() user: UserI,
        @Param('trainingId') trainingId: number,
        @Body() body: Partial<TrainingSessionEntity>,
    ) {
        return this.trainingService.createSession(user, trainingId, body);
    }

    @Patch(':trainingId/sessions/:sessionId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    @Serialize(TrainingSessionEntity)
    updateSession(
        @CurrentUser() user: UserI,
        @Param('trainingId') trainingId: number,
        @Param('sessionId') sessionId: number,
        @Body() body: Partial<TrainingSessionEntity>,
    ) {
        return this.trainingService.updateSession(user, trainingId, sessionId, body);
    }

    @Delete(':trainingId/sessions/:sessionId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN)
    deleteSession(
        @CurrentUser() user: UserI,
        @Param('trainingId') trainingId: number,
        @Param('sessionId') sessionId: number,
    ) {
        return this.trainingService.deleteSession(user, trainingId, sessionId);
    }
}
