/** Created by Pawel Malek **/

import { AvatarRef } from "./UserI";

/**
 * Database entity dla powiadomienia
 */
export interface NotificationI {
    notificationId: number;
    recipientUid: string;
    type: NotificationType;

    // Referencia do źródła powiadomienia
    targetId: string; // chatId, friendshipId, offerId, etc.

    // Dane do wyświetlenia na belce
    title: string;
    message: string;
    messageParams?: Record<string, string>
    icon: NotificationIcon
    avatarRef?: AvatarRef;

    // Timestamp
    createdAt: Date;
    readAt: Date | null;

    // Metadane dla elastyczności (np. sender info, preview tekstu, etc.)
    metadata?: Record<string, any>;
}


/**
 * Enum dla typów powiadomień
 * Rozszerzalny dla nowych typów: job offers, system alerts, etc.
 */
export const NotificationTypes = {
    FRIEND_INVITE: 'FRIEND_INVITE',
    FRIEND_ACCEPTED: 'FRIEND_ACCEPTED',
    FRIEND_REMOVED: 'FRIEND_REMOVED',
    NEW_MESSAGE: 'NEW_MESSAGE',
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

/**
 * Socket events dla powiadomień
 */
export const NotificationEvents = {
    NOTIFICATION_RECEIVED: 'notification:received',
    NOTIFICATION_DELETED: 'notification:deleted',
} as const;


export const NotificationIcons = {
    CHAT: 'chat',
    FRIEND: 'friend',
} as const;

export type NotificationIcon = typeof NotificationIcons[keyof typeof NotificationIcons];