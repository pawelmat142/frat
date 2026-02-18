import { NotificationI } from "@shared/interfaces/NotificationI";
import { httpClient } from "global/services/http";

export const NotificationService = {

    // TODO
    markAsRead(notification: NotificationI): Promise<void> {
        return httpClient.patch(`/notifications/mark-as-read/${notification.notificationId}`);
    }
}