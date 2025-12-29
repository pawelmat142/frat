export interface ChatI {
    chatId: number;
    type: ChatType;

    createdAt: Date;
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

