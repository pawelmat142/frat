import { httpClient } from "global/services/http";
import { ChatI, ChatMessageI, ChatWithMembers } from "@shared/interfaces/ChatI";

export const ChatService = {

    /**
     * Get or create a direct chat with another user
     */
    getOrCreateDirectChat(recipientUid: string): Promise<ChatI> {
        return httpClient.post(`/chat/direct/${recipientUid}`);
    },

    /**
     * Get single chat by ID
     */
    getChatById(chatId: number): Promise<ChatWithMembers> {
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

    /**
     * Clean chat history
     */
    cleanChat(chatId: number): Promise<ChatI> {
        return httpClient.delete(`/chat/${chatId}/messages/clean`);
    },

    /**
     * Clean chat history
     */
    blockChat(chatId: number): Promise<ChatI> {
        return httpClient.post(`/chat/${chatId}/block`);
    },

    /**
     * Unblock chat
     */
    unblockChat(chatId: number): Promise<ChatI> {
        return httpClient.post(`/chat/${chatId}/unblock`);
    },

    /**
     * Delete chat
    */
    deleteChat(chatId: number): Promise<ChatI> {
        return httpClient.delete(`/chat/${chatId}`);
    }

}
