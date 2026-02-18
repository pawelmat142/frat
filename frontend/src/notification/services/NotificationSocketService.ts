import { NotificationEvents, NotificationI, NotificationTypes } from '@shared/interfaces/NotificationI';
import WebSocketService from 'global/web-socket/WebSocketService';

export class NotificationSocketService {
    private webSocket: WebSocketService;
    private inviteListeners: Set<(notification: NotificationI) => void> = new Set();
    private acceptListeners: Set<(notification: NotificationI) => void> = new Set();
    private messageListeners: Set<(notification: NotificationI) => void> = new Set();

    constructor() {
        // Use the same WebSocketService singleton instance as ChatSocketService
        this.webSocket = WebSocketService.getInstance();
        this.setupEventListeners();
        console.log('NotificationSocketService initialized');
    }

    private setupEventListeners(): void {
        this.webSocket.on(NotificationEvents.NOTIFICATION_RECEIVED, (notification: NotificationI) => {
            console.log('on(NotificationEvents.NOTIFICATION_RECEIVED)', notification);
            this.inviteListeners.forEach(listener => listener(notification));
        });

        this.webSocket.on(NotificationEvents.NOTIFICATION_READ, (notification: NotificationI) => {
            console.log('on(NotificationEvents.NOTIFICATION_READ)', notification);
            this.acceptListeners.forEach(listener => listener(notification));
        });

        this.webSocket.on(NotificationEvents.NOTIFICATION_DELETED, (notification: NotificationI) => {
            console.log('on(NotificationEvents.NOTIFICATION_DELETED)', notification);
            this.messageListeners.forEach(listener => listener(notification));
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
        this.inviteListeners.add(listener);
    }

    unregisterInviteListener(listener: (notification: NotificationI) => void): void {
        this.inviteListeners.delete(listener);
    }

    registerAcceptListener(listener: (notification: NotificationI) => void): void {
        this.acceptListeners.add(listener);
    }

    unregisterAcceptListener(listener: (notification: NotificationI) => void): void {
        this.acceptListeners.delete(listener);
    }

    registerMessageListener(listener: (notification: NotificationI) => void): void {
        this.messageListeners.add(listener);
    }

    unregisterMessageListener(listener: (notification: NotificationI) => void): void {
        this.messageListeners.delete(listener);
    }

    isConnected(): boolean {
        return this.webSocket.isConnected();
    }
}

export const notificationSocket = new NotificationSocketService();
