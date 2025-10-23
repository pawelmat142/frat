/** Created by Pawel Malek **/
import {
  Body,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { LogInterceptor } from 'global/interceptors/LogInterceptor';
import { UserI } from '@shared/interfaces/UserI';
import { CurrentUser } from 'auth/decorators/CurrentUserDecorator';
import { Serialize } from 'global/decorators/Serialize';
import { FeedbackService } from './FeedbackService';
import { FeedbackDto } from '@shared/dto/dtos';
import { FeedbackEntity } from './FeedbackEntity';
import { OptionalJwtUser } from 'auth/guards/OptionalJwtUser';

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
  
}
