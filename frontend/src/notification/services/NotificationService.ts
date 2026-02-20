import { NotificationI } from "@shared/interfaces/NotificationI";
import { httpClient } from "global/services/http";

export const NotificationService = {

    getNotifications(): Promise<NotificationI[]> {
        return httpClient.get('/notifications');
    },

    getNotification(notificationId: string): Promise<NotificationI> {
        return httpClient.get(`/notifications/${notificationId}`);
    },

    // TODO
    markAsRead(notification: NotificationI): Promise<void> {
        return httpClient.patch(`/notifications/mark-as-read/${notification.notificationId}`);
    }
}