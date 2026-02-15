import { io, Socket } from 'socket.io-client';
import { FirebaseAuth } from 'auth/services/FirebaseAuth';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

export interface SocketEventListener {
    event: string;
    handler: (...args: any[]) => void;
}

class WebSocketService {
    private static instance: WebSocketService | null = null;
    private socket: Socket | null = null;
    private eventListeners: Map<string, Set<(...args: any[]) => void>> = new Map();
    private isConnecting: boolean = false;

    private constructor() {
        // Private constructor for singleton
    }

    static getInstance(): WebSocketService {
        if (!WebSocketService.instance) {
            WebSocketService.instance = new WebSocketService();
        }
        return WebSocketService.instance;
    }

    async connect(): Promise<void> {
        if (!SOCKET_URL) {
            throw new Error('WebSocket: SOCKET_URL is not defined');
        }

        if (this.socket?.connected) {
            console.log('WebSocket: Already connected');
            return;
        }

        if (this.isConnecting) {
            console.log('WebSocket: Connection in progress, waiting...');
            // Wait for connection to complete
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this.isConnecting) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }

        this.isConnecting = true;

        const token = await FirebaseAuth.getCurrentIdToken();
        if (!token) {
            console.error('WebSocket: No auth token available');
            this.isConnecting = false;
            return;
        }

        this.socket = io(SOCKET_URL, {
            path: '/socket',
            auth: { token },
            query: { token },
            extraHeaders: {
                Authorization: `Bearer ${token}`,
            },
            transports: ['websocket', 'polling'],
        });

        this.socket.on('connect', () => {
            console.log('WebSocket: Connected');
            this.isConnecting = false;
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket: Disconnected');
        });

        this.socket.on('connect_error', (error) => {
            console.error('WebSocket: Connection error', error);
            this.isConnecting = false;
        });

        // Re-register all event listeners after reconnection
        this.eventListeners.forEach((handlers, event) => {
            handlers.forEach(handler => {
                this.socket?.on(event, handler);
            });
        });
    }

    disconnect(): void {
        if (this.socket) {
            console.log('WebSocket: Disconnecting');
            this.socket.disconnect();
            this.socket = null;
        }
    }

    emit<T = any>(event: string, data?: any): Promise<T> {
        return new Promise((resolve, reject) => {
            if (!this.socket?.connected) {
                reject(new Error('Socket not connected'));
                return;
            }

            if (data !== undefined) {
                this.socket.emit(event, data, (response: T) => {
                    resolve(response);
                });
            } else {
                this.socket.emit(event, (response: T) => {
                    resolve(response);
                });
            }
        });
    }

    emitWithoutResponse(event: string, data?: any): void {
        if (!this.socket?.connected) {
            console.warn(`WebSocket: Cannot emit ${event}, socket not connected`);
            return;
        }

        this.socket.emit(event, data);
    }

    on(event: string, handler: (...args: any[]) => void): void {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, new Set());
        }
        this.eventListeners.get(event)!.add(handler);

        if (this.socket?.connected) {
            this.socket.on(event, handler);
        }
    }

    off(event: string, handler: (...args: any[]) => void): void {
        const handlers = this.eventListeners.get(event);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.eventListeners.delete(event);
            }
        }

        if (this.socket) {
            this.socket.off(event, handler);
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    getSocket(): Socket | null {
        return this.socket;
    }
}

export default WebSocketService;
