import { NotificationI } from "@shared/interfaces/NotificationI";
import { httpClient } from "global/services/http";

export const NotificationService = {

    getNotification(notificationId: string): Promise<NotificationI> {
        return httpClient.get(`/notifications/${notificationId}`);
    },

    markAsRead(notification: NotificationI): Promise<void> {
        return httpClient.patch(`/notifications/mark-as-read/${notification.notificationId}`);
    },
    
    deleteNotification(notificationId: number): Promise<void> {
        return httpClient.delete(`/notifications/${notificationId}`);
    }
}