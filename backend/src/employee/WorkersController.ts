/** Created by Pawel Malek **/
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { AvatarRef, UserI, UserRoles } from '@shared/interfaces/UserI';
import { WorkersService } from './services/WorkerService';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { WorkerFormDto, WorkerI, WorkerSearchRequest, WorkerSearchResponse, WorkerSkills, WorkerStatus, WorkerWithCertificates } from '@shared/interfaces/WorkerI';
import { Serialize } from 'global/decorators/Serialize';
import { WorkerEntity } from './model/WorkerEntity';
import { SearchWorkersService } from './services/SearchWorkerService';
import { RolesGuard } from 'auth/guards/RolesGuard';
import { Roles } from 'auth/decorators/RolesDecorator';
import { Public } from 'auth/decorators/PublicDecorator';
import { OptionalJwtUser } from 'auth/guards/OptionalJwtUser';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { Position } from '@shared/interfaces/MapsInterfaces';
import { Header } from '@shared/def/def';

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
  ): Promise<WorkerWithCertificates> {
    return this.workersService.getWorkerWithCertificates(user);
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
  @UseGuards(OptionalJwtUser)
  searchWorkers(
    @Query() filters: WorkerSearchRequest,
    @Headers(Header.LAT_HEADER) lat?: string,
    @Headers(Header.LNG_HEADER) lng?: string,
    @Headers(Header.SEARCH_SESSION) searchSessionId?: string,
    @CurrentUser() user?: UserI,
  ): Promise<WorkerSearchResponse> {
    const viewerLocation: Position | undefined = lat && lng ? {
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng ) : undefined,
    } : undefined;

    return this.searchWorkerService.searchWorkers(filters, user, viewerLocation, searchSessionId);
  }
  
  @Get("/notify-profile-view/:workerId")
  @UseGuards(JwtAuthGuard)
  notifyWorkerView(
    @Param('workerId') workerId: string,
    @CurrentUser() user: UserI,
  ): Promise<void> {
    return this.workersService.notifyWorkerView(Number(workerId), user);
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

  @Put("/skills")
  @UseGuards(JwtAuthGuard)
  @Serialize(WorkerEntity)
  updateSkills(
    @CurrentUser() user: UserI,
    @Body() skills: WorkerSkills
  ): Promise<void> {
    return this.workersService.updateSkills(user, skills);
  }

  @Put("/bio")
  @UseGuards(JwtAuthGuard)
  @Serialize(WorkerEntity)
  updateBio(
    @CurrentUser() user: UserI,
    @Body() bio: { value: string }
  ): Promise<void> {
    return this.workersService.updateBio(user, bio.value);
  }

  @Post("/images")
  @UseGuards(JwtAuthGuard)
  @Serialize(WorkerEntity)
  addImage(
    @CurrentUser() user: UserI,
    @Body() imageRef: AvatarRef
  ): Promise<void> {
    return this.workersService.addImage(user, imageRef);
  }

  @Delete("/images")
  @UseGuards(JwtAuthGuard)
  @Serialize(WorkerEntity)
  removeImage(
    @CurrentUser() user: UserI,
    @Query('publicId') publicId: string
  ): Promise<void> {
    return this.workersService.removeImage(user, publicId);
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