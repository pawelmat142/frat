/** Created by Pawel Malek **/
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { FeedbackController } from './FeedbackController';
import { FeedbackEntity } from './FeedbackEntity';
import { FeedbackService } from './FeedbackService';
import { AuthModule } from 'auth/AuthModule';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            FeedbackEntity,
        ]),
        
        AuthModule
    ],
    providers: [
        FeedbackService,
    ],
    controllers: [
        FeedbackController
    ],
})
export class FeedbackModule { }
