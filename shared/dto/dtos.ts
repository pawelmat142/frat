export interface FeedbackDto {
    message: string;
    contactEmail?: string;
}

export interface ApiResponse {
    success?: boolean;
    message?: string;
}