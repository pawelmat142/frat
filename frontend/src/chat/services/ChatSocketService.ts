import { ChatEvents, ChatI, ChatMessageI, SendMessageDto, SendMessageResponse } from '@shared/interfaces/ChatI';
import WebSocketService from 'global/web-socket/WebSocketService';

class ChatSocketService {
    private webSocket: WebSocketService;
    private messageListeners: Map<number, (message: ChatMessageI) => void> = new Map();
    private loadChatListeners: Set<(chat: ChatI) => void> = new Set();

    constructor() {
        this.webSocket = WebSocketService.getInstance();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.webSocket.on(ChatEvents.RECEIVE_MESSAGE, (message: ChatMessageI) => {
            const messageListener = this.messageListeners.get(message.chatId);
            if (messageListener) {
                messageListener(message);
            } else {
                console.warn(`No message listener registered for chatId ${message.chatId}`);
            }
        });

        this.webSocket.on(ChatEvents.LOAD_CHAT, (chat: ChatI) => {
            this.loadChatListeners.forEach(listener => listener(chat));
        });
    }

    async connect(): Promise<void> {
        await this.webSocket.connect();
    }

    disconnect(): void {
        this.webSocket.disconnect();
    }

    joinChat(chatId: number): void {
        this.webSocket.emitWithoutResponse(ChatEvents.OPEN_CHAT, { chatId });
    }

    leaveChat(chatId: number): void {
        this.webSocket.emitWithoutResponse(ChatEvents.LEAVE_CHAT, { chatId });
    }

    async sendMessage(msg: SendMessageDto): Promise<SendMessageResponse> {
        try {
            const response = await this.webSocket.emit<SendMessageResponse>(ChatEvents.SEND_MESSAGE, msg);
            console.log('ChatSocket: sendMessage response', response);
            return response;
        } catch (error) {
            console.error('ChatSocket: sendMessage error', error);
            return { error: 'Not connected' };
        }
    }

    registerMessageListener(chatId: number, messageListener: (message: ChatMessageI) => void): void {
        this.messageListeners.set(chatId, messageListener);
    }

    unregisterMessageListener(chatId: number): void {
        this.messageListeners.delete(chatId);
    }

    registerChatListener(loadChatListener: (chat: ChatI) => void): void {
        this.loadChatListeners.add(loadChatListener);
    }

    unregisterChatListener(loadChatListener: (chat: ChatI) => void): void {
        this.loadChatListeners.delete(loadChatListener);
    }

    isConnected(): boolean {
        return this.webSocket.isConnected();
    }
}

export const chatSocket = new ChatSocketService();
