/** Created by Pawel Malek **/
import { Injectable, Logger } from '@nestjs/common';
import { UserI } from '@shared/interfaces/UserI';
import { FeedbackEntity } from './FeedbackEntity';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedbackDto } from '@shared/dto/dtos';
import { Repository } from 'typeorm';
import { FeedbackStatuses } from '@shared/interfaces/FeedbackI';

@Injectable()
export class FeedbackService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(FeedbackEntity)
        private feedbackRepository: Repository<FeedbackEntity>,
    ) { }


    public async createFeedback(dto: FeedbackDto, user?: UserI): Promise<FeedbackEntity> {
        const feedback = this.feedbackRepository.create({
            ...dto,
            uid: user?.uid,
            status: FeedbackStatuses.NEW,
        })
        const result = await this.feedbackRepository.save(feedback);
        this.logger.log(`Created Feedback: ${result.feedbackId}, by user: ${user?.uid || 'anonymous'}`);
        return result;
    }

    public async listFeedbacks(): Promise<FeedbackEntity[]> {
        return this.feedbackRepository.find();
    }

    public async deleteFeedback(feedbackId: number): Promise<void> {
        await this.feedbackRepository.delete({ feedbackId });
    }

}
