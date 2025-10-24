import { FeedbackDto } from "@shared/dto/dtos";
import { httpClient } from "./http";
import { FeedbackI } from "@shared/interfaces/FeedbackI";

export const FeedbackService = {

    createFeedback(dto: FeedbackDto): Promise<FeedbackDto> {
        return httpClient.post<FeedbackDto>('/feedback', dto);
    },

    list(): Promise<FeedbackI[]> {
        return httpClient.get<FeedbackI[]>('/feedback/list');
    }

};
