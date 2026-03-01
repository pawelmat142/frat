/** Created by Pawel Malek **/
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { UserI, UserRoles } from '@shared/interfaces/UserI';
import { WorkersService } from './services/WorkerService';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { WorkerFormDto, WorkerI, WorkerSearchFilters, WorkerSearchRequest, WorkerSearchResponse, WorkerStatus } from '@shared/interfaces/WorkerProfileI';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { Serialize } from 'global/decorators/Serialize';
import { WorkerEntity } from './model/WorkerEntity';
import { SearchWorkersService } from './services/SearchWorkerService';
import { RolesGuard } from 'auth/guards/RolesGuard';
import { Roles } from 'auth/decorators/RolesDecorator';
import { Public } from 'auth/decorators/PublicDecorator';

@Controller('api/worker')
@UseInterceptors(LogInterceptor)
export class WorkersController {

  constructor(
    private readonly workersService: WorkersService,
    private readonly searchWorkerService: SearchWorkersService
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(WorkerEntity)
  getWorker(
    @CurrentUser() user: UserI,
  ): Promise<WorkerI> {
    return this.workersService.getWorker(user);
  }

  @Get("/:displayName")
  @Serialize(WorkerEntity)
  @Public()
  fetchWorkerByDisplayName(
    @Param('displayName') displayName: string
  ): Promise<WorkerI> {
    return this.workersService.fetchWorkerByDisplayName(displayName);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Serialize(WorkerEntity)
  createWorker(
    @CurrentUser() user: UserI,
    @Body() form: WorkerFormDto
  ): Promise<WorkerI> {
    return this.workersService.createWorker(user, form);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @Serialize(WorkerEntity)
  updateWorker(
    @CurrentUser() user: UserI,
    @Body() form: WorkerFormDto
  ): Promise<WorkerI> {
    return this.workersService.updateWorker(user, form);
  }

  @Get("/search/list")
  @Serialize(WorkerEntity)
  searchWorkers(
    @CurrentUser() user: UserI,
    @Query() filters: WorkerSearchRequest
  ): Promise<WorkerSearchResponse> {
    return this.searchWorkerService.searchWorkers(user, filters);
  }
  
  @Get("/notify-profile-view/:uid")
  @UseGuards(JwtAuthGuard)
  notifyWorkerView(
    @Param('uid') uid: string,
    @CurrentUser() user: UserI,
  ): Promise<void> {
    return this.workersService.notifyWorkerView(uid, user.uid);
  }
  
  @Get("/notify-profile-like/:workerId")
  @UseGuards(JwtAuthGuard)
  notifyWorkerLike(
    @Param('workerId') workerId: string,
    @CurrentUser() user: UserI,
  ): Promise<string[]> {
    return this.workersService.notifyWorkerLike(Number(workerId), user.uid);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  deleteProfile(
    @CurrentUser() user: UserI,
  ): Promise<void> {
    return this.workersService.deleteProfileByUid(user);
  }

  @Patch("/activation")
  @UseGuards(JwtAuthGuard)
  @Serialize(WorkerEntity)
  activation(
    @CurrentUser() user: UserI,
  ): Promise<WorkerI> {
    return this.workersService.activation(user);
  }



  // TODO przerobic na admin controller
  // ADMIN MANAGEMENT ACTIONS
  @Get("/admin/list")
  @Serialize(WorkerEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  listProfiles(): Promise<WorkerI[]> {
    return this.workersService.listProfiles();
  }

  @Put("/admin/:id/activation/:status")
  @Serialize(WorkerEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  activationAdmin(
    @Param('id') id: string,
    @Param('status') status: WorkerStatus
  ): Promise<WorkerI> {
    return this.workersService.activationByAdmin(Number(id), status);
  }

  @Delete("/admin/:id")
  @Serialize(WorkerEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  deleteProfileByAdmin(
    @Param('id') id: string,
  ): Promise<void> {
    return this.workersService.deleteProfile(Number(id));
  }

  @Delete("/admin")
  @Serialize(WorkerEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  deleteAllProfiles(): Promise<void> {
    return this.workersService.deleteAllProfiles();
  }

  @Post("/admin/initial-load")
  @Serialize(WorkerEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  initialLoad(): Promise<void> {
    return this.workersService.initialLoad();
  }


}