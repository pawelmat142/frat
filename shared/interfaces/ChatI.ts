import { AvatarRef, UserI } from "./UserI";

export interface ChatI {
    chatId: number;
    type: ChatType;

    blockedByUid?: string;
    createdAt: Date;
    updatedAt: Date;
    latestMessageContent?: string;
    members: ChatMemberI[];
}

export interface ChatMemberI {
    chatId: number;
    uid: string;
    status: ChatMemberStatus;
    joinedAt: Date;
    unreadCount: number;
}

export const ChatMemberStatuses = {
    OPEN: 'OPEN',
    LEFT: 'LEFT',
} as const;
export type ChatMemberStatus = typeof ChatMemberStatuses[keyof typeof ChatMemberStatuses];

export interface ChatMessageI {
    messageId: number;
    type: MessageType;
    chatId: number;
    senderUid: string;
    content: string;
    imageRefs?: AvatarRef[] | null;
    createdAt: Date;
    readAt: Date | null;
}

export const MessageTypes = {
    TEXT: 'TEXT',
    IMAGE: 'IMAGE',
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
    OPEN_CHAT: 'openChat',
    LEAVE_CHAT: 'leaveChat',
    
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
} as const;

export type ChatEvent = typeof ChatEvents[keyof typeof ChatEvents];

export interface SendMessageDto {
    chatId: number;
    content: string;
    imageRefs?: AvatarRef[];
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

export interface ChatWithMembers extends ChatI {
    members: ChatMemberWithUserI[];
}

export interface ChatMemberWithUserI extends ChatMemberI {
    user: UserI;
}