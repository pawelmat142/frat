/** Created by Pawel Malek **/
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { EmployeeProfileForm, EmployeeProfileI, EmployeeProfileSearchForm, EmployeeProfileSearchResponse, EmployeeProfileStatus } from '@shared/interfaces/EmployeeProfileI';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { Serialize } from 'global/decorators/Serialize';
import { EmployeeProfileEntity } from './model/EmployeeProfileEntity';
import { SearchEmployeeProfileService } from './services/SearchEmployeeProfileService';
import { RolesGuard } from 'auth/guards/RolesGuard';
import { Roles } from 'auth/decorators/RolesDecorator';

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
  
  @Post()
  @UseGuards(JwtAuthGuard)
  @Serialize(EmployeeProfileEntity)
  createEmployeeProfile(
    @CurrentUser() user: UserI,
    @Body() form: EmployeeProfileForm
  ): Promise<EmployeeProfileI> {
    return this.employeeProfileService.createEmployeeProfile(user, form);
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  @Serialize(EmployeeProfileEntity)
  updateEmployeeProfile(
    @CurrentUser() user: UserI,
    @Body() form: EmployeeProfileForm
  ): Promise<EmployeeProfileI> {
    return this.employeeProfileService.updateEmployeeProfile(user, form);
  }


  @Get("/search")
  @Serialize(EmployeeProfileEntity)
  searchEmployeeProfiles(
    @CurrentUser() user: UserI,
    @Query() query: EmployeeProfileSearchForm
  ): Promise<EmployeeProfileSearchResponse> {
    return this.searchEmployeeProfileService.searchEmployeeProfiles(user, query);
  }

  
  
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
  activation(
    @Param('id') id: string,
    @Param('status') status: EmployeeProfileStatus
  ): Promise<EmployeeProfileI> {
    return this.employeeProfileService.activation(Number(id), status);
  }
  
  @Delete("/admin/:id") 
  @Serialize(EmployeeProfileEntity)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  deleteProfile(
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