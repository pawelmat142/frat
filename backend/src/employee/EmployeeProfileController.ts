/** Created by Pawel Malek **/
import {
  Body,
  Controller,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { UserI } from '@shared/interfaces/UserI';
import { EmployeeProfileService } from './services/EmployeeProfileService';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { EmployeeProfileI } from '@shared/interfaces/EmployeeProfileI';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { EmployeeProfileForm } from '@shared/def/employee-profile.def';

@Controller('api/employee-profile')
@UseInterceptors(LogInterceptor)
export class EmployeeProfileController {

  constructor(private readonly employeeProfileService: EmployeeProfileService) { }

  @Put()
  @UseGuards(JwtAuthGuard)
  createEmployeeProfile(
    @CurrentUser() user: UserI,
    @Body() form: EmployeeProfileForm
  ): Promise<EmployeeProfileI> {
    return this.employeeProfileService.createEmployeeProfile(user, form);
  }
  
}
