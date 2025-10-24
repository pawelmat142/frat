export interface FeedbackI {

    feedbackId: number;
    
    status: FeedbackStatus
    
    uid?: string;

    message: string

    contactEmail?: string;

    createdAt: Date;

}

export const FeedbackStatuses = {
    NEW: 'NEW',
    RESOLVED: 'RESOLVED',
    RESPONDED: 'RESPONDED',
    INACTIVE: 'INACTIVE',
} as const;

export type FeedbackStatus = typeof FeedbackStatuses[keyof typeof FeedbackStatuses]