import { UserI } from "./UserI";

export interface ChatI {
    chatId: number;
    type: ChatType;

    blockedByUid?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ChatMemberI {
    chatId: number;
    uid: string;
    joinedAt: Date;
}

export interface ChatMessageI {
    messageId: number;
    type: MessageType;
    chatId: number;
    senderUid: string;
    content: string;
    createdAt: Date;
    readAt: Date | null;
}

export const MessageTypes = {
    TEXT: 'TEXT',
} as const
export type MessageType = typeof MessageTypes[keyof typeof MessageTypes];

export const ChatTypes = {
    DIRECT: 'DIRECT',
    GROUP: 'GROUP',
} as const;
export type ChatType = typeof ChatTypes[keyof typeof ChatTypes];

export const ChatEvents = {
    SEND_MESSAGE: 'sendMessage',
    RECEIVE_MESSAGE: 'receiveMessage',
    LOAD_CHAT: 'loadChat',
    JOIN_CHAT: 'joinChat',
    
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
} as const;

export type ChatEvent = typeof ChatEvents[keyof typeof ChatEvents];

export interface SendMessageDto {
    chatId: number;
    content: string;
}

export interface SendMessageResponse {
    success?: boolean;
    message?: ChatMessageI;
    error?: string;
}

export interface JoinChatResponse {
    success?: boolean;
    error?: string;
}

export interface ChatResponse extends ChatI {
    members: ChatMemberWithUserI[];
}

export interface ChatMemberWithUserI extends ChatMemberI {
    user: UserI;
}