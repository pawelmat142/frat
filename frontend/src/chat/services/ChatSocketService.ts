import { io, Socket } from 'socket.io-client';
import { FirebaseAuth } from 'auth/services/FirebaseAuth';
import { ChatMessageI } from '@shared/interfaces/ChatI';

const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:3100';

class ChatSocketService {
    private socket: Socket | null = null;
    private messageListeners: Map<number, (message: ChatMessageI) => void> = new Map();
    private newChatListeners: Set<(chat: any) => void> = new Set();

    async connect(): Promise<void> {
        if (this.socket?.connected) {
            return;
        }

        const token = await FirebaseAuth.getCurrentIdToken();
        if (!token) {
            console.error('ChatSocket: No auth token available');
            return;
        }

        this.socket = io(`${SOCKET_URL}/chat`, {
            auth: { token },
            query: { token },
            extraHeaders: {
                Authorization: `Bearer ${token}`,
            },
            transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
            console.log('ChatSocket: Connected');
        });

        this.socket.on('disconnect', () => {
            console.log('ChatSocket: Disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('ChatSocket: Connection error', error);
        });

        this.socket.on('newMessage', (message: ChatMessageI) => {
            const listener = this.messageListeners.get(message.chatId);
            if (listener) {
                listener(message);
            }
        });

        this.socket.on('newChat', (chat: any) => {
            this.newChatListeners.forEach(listener => listener(chat));
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    joinChat(chatId: number): void {
        if (this.socket?.connected) {
            this.socket.emit('joinChat', { chatId });
        }
    }

    sendMessage(chatId: number, content: string): Promise<{ success?: boolean; error?: string; message?: ChatMessageI }> {
        return new Promise((resolve) => {
            if (!this.socket?.connected) {
                resolve({ error: 'Not connected' });
                return;
            }

            this.socket.emit('sendMessage', { chatId, content }, (response: any) => {
                resolve(response);
            });
        });
    }

    onMessage(chatId: number, callback: (message: ChatMessageI) => void): void {
        this.messageListeners.set(chatId, callback);
    }

    offMessage(chatId: number): void {
        this.messageListeners.delete(chatId);
    }

    onNewChat(callback: (chat: any) => void): void {
        this.newChatListeners.add(callback);
    }

    offNewChat(callback: (chat: any) => void): void {
        this.newChatListeners.delete(callback);
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const chatSocket = new ChatSocketService();
