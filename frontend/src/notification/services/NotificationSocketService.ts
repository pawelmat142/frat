import { NotificationEvents, NotificationI } from '@shared/interfaces/NotificationI';
import WebSocketService from 'global/web-socket/WebSocketService';

export class NotificationSocketService {
    private webSocket: WebSocketService;
    private receivedListeners: Set<(notification: NotificationI) => void> = new Set();
    private readListeners: Set<(notificationId: string) => void> = new Set();
    private deletedListeners: Set<(notificationId: string) => void> = new Set();

    constructor() {
        // Use the same WebSocketService singleton instance as ChatSocketService
        this.webSocket = WebSocketService.getInstance();
        this.setupEventListeners();
        console.log('NotificationSocketService initialized');
    }

    private setupEventListeners(): void {
        this.webSocket.on(NotificationEvents.NOTIFICATION_RECEIVED, (notification: NotificationI) => {
            console.log('on(NotificationEvents.NOTIFICATION_RECEIVED)', notification);
            this.receivedListeners.forEach(listener => listener(notification));
        });
        
        // TODO wystarczy id
        this.webSocket.on(NotificationEvents.NOTIFICATION_READ, (notificationId: string) => {
            console.log('on(NotificationEvents.NOTIFICATION_READ)', notificationId);
            this.readListeners.forEach(listener => listener(notificationId));
        });
        
        // TODO wystarczy id
        this.webSocket.on(NotificationEvents.NOTIFICATION_DELETED, (notificationId: string) => {
            console.log('on(NotificationEvents.NOTIFICATION_DELETED)', notificationId);
            this.deletedListeners.forEach(listener => listener(notificationId));
        });
    }

    async connect(): Promise<void> {
        await this.webSocket.connect();
    }

    
    disconnect(): void {
        // Don't actually disconnect - shared with chat
        console.log('NotificationSocket: disconnect requested but socket is shared');
    }

    registerInviteListener(listener: (notification: NotificationI) => void): void {
        this.receivedListeners.add(listener);
    }

    unregisterInviteListener(listener: (notification: NotificationI) => void): void {
        this.receivedListeners.delete(listener);
    }

    registerReadListener(listener: (notificationId: string) => void): void {
        this.readListeners.add(listener);
    }

    unregisterReadListener(listener: (notificationId: string) => void): void {
        this.readListeners.delete(listener);
    }

    registerDeletedListener(listener: (notificationId: string) => void): void {
        this.deletedListeners.add(listener);
    }

    unregisterDeletedListener(listener: (notificationId: string) => void): void {
        this.deletedListeners.delete(listener);
    }

    isConnected(): boolean {
        return this.webSocket.isConnected();
    }
}

export const notificationSocket = new NotificationSocketService();
