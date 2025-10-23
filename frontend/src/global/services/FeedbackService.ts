import { FeedbackDto } from "@shared/dto/dtos";
import { httpClient } from "./http";

export const FeedbackService = {

    // TODO prezentacja feedbackow w admin app
    createFeedback(dto: FeedbackDto): Promise<FeedbackDto> {
        return httpClient.post<FeedbackDto>('feedback', dto);
    }

};
