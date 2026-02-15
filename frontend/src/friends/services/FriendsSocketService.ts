import { FriendshipEvents, FriendshipI } from '@shared/interfaces/FriendshipI';
import WebSocketService from 'global/web-socket/WebSocketService';

class FriendsSocketService {
    private webSocket: WebSocketService;
    private inviteListeners: Set<(friendship: FriendshipI) => void> = new Set();
    private acceptListeners: Set<(friendship: FriendshipI) => void> = new Set();
    private rejectListeners: Set<(friendship: FriendshipI) => void> = new Set();
    private removeListeners: Set<(friendshipId: number) => void> = new Set();

    constructor() {
        // Use the same WebSocketService singleton instance as ChatSocketService
        this.webSocket = WebSocketService.getInstance();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.webSocket.on(FriendshipEvents.INVITE_RECEIVED, (friendship: FriendshipI) => {
            console.log('on(FriendshipEvents.INVITE_RECEIVED)', friendship);
            this.inviteListeners.forEach(listener => listener(friendship));
        });

        this.webSocket.on(FriendshipEvents.INVITE_ACCEPTED, (friendship: FriendshipI) => {
            console.log('on(FriendshipEvents.INVITE_ACCEPTED)', friendship);
            this.acceptListeners.forEach(listener => listener(friendship));
        });

        this.webSocket.on(FriendshipEvents.INVITE_REJECTED, (friendship: FriendshipI) => {
            console.log('on(FriendshipEvents.INVITE_REJECTED)', friendship);
            this.rejectListeners.forEach(listener => listener(friendship));
        });

        this.webSocket.on(FriendshipEvents.FRIEND_REMOVED, (friendshipId: number) => {
            console.log('on(FriendshipEvents.FRIEND_REMOVED)', friendshipId);
            this.removeListeners.forEach(listener => listener(friendshipId));
        });
    }

    async connect(): Promise<void> {
        await this.webSocket.connect();
    }

    disconnect(): void {
        // Don't actually disconnect - shared with chat
        console.log('FriendsSocket: disconnect requested but socket is shared');
    }

    registerInviteListener(listener: (friendship: FriendshipI) => void): void {
        this.inviteListeners.add(listener);
    }

    unregisterInviteListener(listener: (friendship: FriendshipI) => void): void {
        this.inviteListeners.delete(listener);
    }

    registerAcceptListener(listener: (friendship: FriendshipI) => void): void {
        this.acceptListeners.add(listener);
    }

    unregisterAcceptListener(listener: (friendship: FriendshipI) => void): void {
        this.acceptListeners.delete(listener);
    }

    registerRejectListener(listener: (friendship: FriendshipI) => void): void {
        this.rejectListeners.add(listener);
    }

    unregisterRejectListener(listener: (friendship: FriendshipI) => void): void {
        this.rejectListeners.delete(listener);
    }

    registerRemoveListener(listener: (friendshipId: number) => void): void {
        this.removeListeners.add(listener);
    }

    unregisterRemoveListener(listener: (friendshipId: number) => void): void {
        this.removeListeners.delete(listener);
    }

    isConnected(): boolean {
        return this.webSocket.isConnected();
    }
}

export const friendsSocket = new FriendsSocketService();
