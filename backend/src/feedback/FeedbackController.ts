/** Created by Pawel Malek **/
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { UserI, UserRoles } from '@shared/interfaces/UserI';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { Serialize } from 'global/decorators/Serialize';
import { FeedbackService } from './FeedbackService';
import { FeedbackDto } from '@shared/dto/dtos';
import { FeedbackEntity } from './FeedbackEntity';
import { OptionalJwtUser } from 'auth/guards/OptionalJwtUser';
import { RolesGuard } from 'auth/guards/RolesGuard';
import { JwtAuthGuard } from 'auth/guards/JwtAuthGuard';
import { Roles } from 'auth/decorators/RolesDecorator';

@Controller('api/feedback')
@UseInterceptors(LogInterceptor)
export class FeedbackController {

  constructor(private readonly feedbackService: FeedbackService) { }

  @Post()
  @UseGuards(OptionalJwtUser)
  @Serialize(FeedbackEntity)
  createFeedback(
    @Body() dto: FeedbackDto,
    @CurrentUser() user?: UserI
  ): Promise<FeedbackEntity> {
    return this.feedbackService.createFeedback(dto, user);
  }

  @Get('/list')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  @Serialize(FeedbackEntity)
  listFeedbacks(): Promise<FeedbackEntity[]> {
    return this.feedbackService.listFeedbacks();
  }

  @Delete('/:feedbackId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRoles.ADMIN, UserRoles.SUPERADMIN)
  async deleteFeedback(
    @Param('feedbackId') feedbackId: string
  ): Promise<void> {
    return this.feedbackService.deleteFeedback(Number(feedbackId));
  }
  
}
