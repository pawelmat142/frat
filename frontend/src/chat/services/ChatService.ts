import { httpClient } from "global/services/http";
import { ChatI, ChatMessageI } from "@shared/interfaces/ChatI";

export const ChatService = {

    /**
     * Get all chats for current user
     */
    // TODO refactor to initial load
    getMyChats(): Promise<ChatI[]> {
        return httpClient.get('/chat');
    },

    /**
     * Get or create a direct chat with another user
     */
    getOrCreateDirectChat(recipientUid: string): Promise<ChatI> {
        return httpClient.post(`/chat/direct/${recipientUid}`);
    },

    /**
     * Get single chat by ID
     */
    getChatById(chatId: number): Promise<ChatI> {
        return httpClient.get(`/chat/${chatId}`);
    },

    /**
     * Get messages for a chat
     */
    getChatMessages(chatId: number, limit = 50, offset = 0): Promise<ChatMessageI[]> {
        return httpClient.get(`/chat/${chatId}/messages`, {
            params: { limit, offset }
        });
    },

};
