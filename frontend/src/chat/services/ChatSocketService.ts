import { io, Socket } from 'socket.io-client';
import { FirebaseAuth } from 'auth/services/FirebaseAuth';
import { ChatEvents, ChatI, ChatMessageI, SendMessageDto, SendMessageResponse } from '@shared/interfaces/ChatI';

const SOCKET_URL = process.env.REACT_APP_API_URL

class ChatSocketService {
    private socket: Socket | null = null;
    private messageListeners: Map<number, (message: ChatMessageI) => void> = new Map()
    private loadChatListeners: Set<(chat: ChatI) => void> = new Set()

    async connect(): Promise<void> {
        if (!SOCKET_URL) {
            throw new Error('ChatSocket: SOCKET_URL is not defined')
        }
        console.log('ChatSocket: Connecting to', SOCKET_URL)
        if (this.socket?.connected) {
            return;
        }

        const token = await FirebaseAuth.getCurrentIdToken()
        if (!token) {
            console.error('ChatSocket: No auth token available')
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

        this.socket.on(ChatEvents.CONNECT, () => {
            console.log('ChatSocket: Connected')
        });

        this.socket.on(ChatEvents.DISCONNECT, () => {
            console.log('ChatSocket: Disconnected')
        });

        this.socket.on(ChatEvents.CONNECT_ERROR, (error) => {
            console.error('ChatSocket: Connection error', error);
        });

        this.socket.on(ChatEvents.RECEIVE_MESSAGE, (message: ChatMessageI) => {
            console.log('on(ChatEvents.RECEIVE_MESSAGE', message)
            const messageListener = this.messageListeners.get(message.chatId)
            if (messageListener) {
                messageListener(message)
            } else {
                console.warn(`No message listener registered for chatId ${message.chatId}`)
            }
        });

        this.socket.on(ChatEvents.LOAD_CHAT, (chat: ChatI) => {
            console.log('on(ChatEvents.LOAD_CHAT', chat)
            this.loadChatListeners.forEach(listener => listener(chat))
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect()
            this.socket = null
        }
    }

    joinChat(chatId: number): void {
        if (this.socket?.connected) {
            this.socket.emit(ChatEvents.OPEN_CHAT, { chatId })
        }
    }

    leaveChat(chatId: number): void {
        if (this.socket?.connected) {
            this.socket.emit(ChatEvents.LEAVE_CHAT, { chatId })
        }
    }

    sendMessage(msg: SendMessageDto): Promise<SendMessageResponse> {
        return new Promise((resolve) => {
            if (!this.socket?.connected) {
                resolve({ error: 'Not connected' })
                return;
            }

            this.socket.emit(ChatEvents.SEND_MESSAGE, msg, (response: SendMessageResponse) => {
                console.log('ChatSocket: sendMessage response', response)
                resolve(response)
            });
        });
    }

    registerMessageListener(chatId: number, messageListener: (message: ChatMessageI) => void): void {
        this.messageListeners.set(chatId, messageListener)
    }

    unregisterMessageListener(chatId: number): void {
        this.messageListeners.delete(chatId)
    }

    registerChatListener(loadChatListener: (chat: ChatI) => void): void {
        this.loadChatListeners.add(loadChatListener)
    }

    unregisterChatListener(loadChatListener: (chat: ChatI) => void): void {
        this.loadChatListeners.delete(loadChatListener)
    }

    isConnected(): boolean {
        return this.socket?.connected || false
    }
}

export const chatSocket = new ChatSocketService()
