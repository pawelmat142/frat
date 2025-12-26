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
import { EmployeeProfileService } from './services/EmployeeProfileService';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { EmployeeProfileFormDto, EmployeeProfileI, EmployeeProfileSearchFilters, EmployeeProfileSearchResponse, EmployeeProfileStatus } from '@shared/interfaces/EmployeeProfileI';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { Serialize } from 'global/decorators/Serialize';
import { EmployeeProfileEntity } from './model/EmployeeProfileEntity';
import { SearchEmployeeProfileService } from './services/SearchEmployeeProfileService';
import { RolesGuard } from 'auth/guards/RolesGuard';
import { Roles } from 'auth/decorators/RolesDecorator';
import { Public } from 'auth/decorators/PublicDecorator';

@Controller('api/employee-profile')
@UseInterceptors(LogInterceptor)
export class EmployeeProfileController {

  constructor(
    private readonly employeeProfileService: EmployeeProfileService,
    private readonly searchEmployeeProfileService: SearchEmployeeProfileService
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Serialize(EmployeeProfileEntity)
  getEmployeeProfile(
    @CurrentUser() user: UserI,
  ): Promise<EmployeeProfileI> {
    return this.employeeProfileService.getEmployeeProfile(user);
  }

  @Get("/:displayName")
  @Serialize(EmployeeProfileEntity)
  @Public()
  getEmployeeProfileByDisplayName(
    @Param('displayName') displayName: string
  ): Promise<EmployeeProfileI> {
    return this.employeeProfileService.getEmployeeProfileByDisplayName(displayName);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Serialize(EmployeeProfileEntity)
  createEmployeeProfile(
    @CurrentUser() user: UserI,
    @Body() form: EmployeeProfileFormDto
  ): Promise<EmployeeProfileI> {
    return this.employeeProfileService.createEmployeeProfile(user, form);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @Serialize(EmployeeProfileEntity)
  updateEmployeeProfile(
    @CurrentUser() user: UserI,
    @Body() form: EmployeeProfileFormDto
  ): Promise<EmployeeProfileI> {
    return this.employeeProfileService.updateEmployeeProfile(user, form);
  }

  @Get("/search/list")
  @Serialize(EmployeeProfileEntity)
  searchEmployeeProfiles(
    @CurrentUser() user: UserI,
    @Query() filters: EmployeeProfileSearchFilters
  ): Promise<EmployeeProfileSearchResponse> {
    return this.searchEmployeeProfileService.searchEmployeeProfiles(user, filters);
  }
  
  @Get("/notify-profile-view/:profileUid")
  @UseGuards(JwtAuthGuard)
  notifyProfileView(
    @Param('profileUid') profileUid: string,
    @CurrentUser() user: UserI,
  ): Promise<void> {
    return this.employeeProfileService.notifyProfileView(profileUid, user.uid);
  }
  
  @Get("/notify-profile-like/:employeeProfileId")
  @UseGuards(JwtAuthGuard)
  notifyProfileLike(
    @Param('employeeProfileId') employeeProfileId: string,
    @CurrentUser() user: UserI,
  ): Promise<string[]> {
    return this.employeeProfileService.notifyProfileLike(Number(employeeProfileId), user.uid);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  deleteProfile(
    @CurrentUser() user: UserI,
  ): Promise<void> {
    return this.employeeProfileService.deleteProfileByUid(user);
  }

  @Patch("/activation")
  @UseGuards(JwtAuthGuard)
  @Serialize(EmployeeProfileEntity)
  activation(
    @CurrentUser() user: UserI,
  ): Promise<EmployeeProfileI> {
    return this.employeeProfileService.activation(user);
  }



  // TODO przerobic na admin controller
  // ADMIN MANAGEMENT ACTIONS
  @Get("/admin/list")
  @Serialize(EmployeeProfileEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  listProfiles(): Promise<EmployeeProfileI[]> {
    return this.employeeProfileService.listProfiles();
  }

  @Put("/admin/:id/activation/:status")
  @Serialize(EmployeeProfileEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  activationAdmin(
    @Param('id') id: string,
    @Param('status') status: EmployeeProfileStatus
  ): Promise<EmployeeProfileI> {
    return this.employeeProfileService.activationByAdmin(Number(id), status);
  }

  @Delete("/admin/:id")
  @Serialize(EmployeeProfileEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  deleteProfileByAdmin(
    @Param('id') id: string,
  ): Promise<void> {
    return this.employeeProfileService.deleteProfile(Number(id));
  }

  @Delete("/admin")
  @Serialize(EmployeeProfileEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  deleteAllProfiles(): Promise<void> {
    return this.employeeProfileService.deleteAllProfiles();
  }

  @Post("/admin/initial-load")
  @Serialize(EmployeeProfileEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  initialLoad(): Promise<void> {
    return this.employeeProfileService.initialLoad();
  }


}