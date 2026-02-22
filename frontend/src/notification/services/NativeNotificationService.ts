/**
 * Service for managing native browser notifications (Notification API).
 * Shows a single notification with the count of unread app notifications.
 * Clears the native notification when all are read.
 */

const NOTIFICATION_TAG = 'frat-unread';

export abstract class NativeNotificationService {

    static isSupported(): boolean {
        return 'Notification' in window;
    }

    static async requestPermission(): Promise<boolean> {
        if (!this.isSupported()) return false;
        if (Notification.permission === 'granted') return true;
        if (Notification.permission === 'denied') return false;

        const result = await Notification.requestPermission();
        return result === 'granted';
    }

    static isPermissionGranted(): boolean {
        return this.isSupported() && Notification.permission === 'granted';
    }

    /**
     * Shows or clears native notification based on unread count.
     * Uses a single tag so only one notification is visible at a time.
     */
    static updateUnreadNotification(unreadCount: number): void {
        if (!this.isPermissionGranted()) return;

        if (unreadCount <= 0) {
            this.clearNotification();
            return;
        }

        this.showNotification(unreadCount);
    }

    private static showNotification(count: number): void {
        const title = 'FRAT';
        const body = count === 1
            ? `Masz 1 nieprzeczytane powiadomienie`
            : `Masz ${count} nieprzeczytanych powiadomień`;

        const notificationData = { url: '/notifications' };

        // Use service worker registration for persistent notifications if available
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.ready.then(registration => {
                const options: Record<string, unknown> = {
                    body,
                    icon: '/assets/icons/icon-192.png',
                    badge: '/assets/icons/icon-192.png',
                    tag: NOTIFICATION_TAG,
                    renotify: true,
                    data: notificationData,
                };
                registration.showNotification(title, options as NotificationOptions);
            });
            return;
        }

        // Fallback to regular Notification API
        new Notification(title, {
            body,
            icon: '/assets/icons/icon-192.png',
            tag: NOTIFICATION_TAG,
            data: notificationData,
        });
    }

    private static clearNotification(): void {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then(registration => {
                registration.getNotifications({ tag: NOTIFICATION_TAG }).then(notifications => {
                    notifications.forEach(n => n.close());
                });
            });
        }
    }
}
