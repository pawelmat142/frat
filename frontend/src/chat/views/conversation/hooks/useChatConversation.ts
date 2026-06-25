import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatI, ChatMessageI, ChatWithMembers } from "@shared/interfaces/ChatI";
import { ChatService } from "chat/services/ChatService";
import { chatSocket } from "chat/services/ChatSocketService";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";
import { Path } from "../../../../path";

export const useChatConversation = (chatId: string | undefined) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const confirm = useConfirm();

    const [chat, setChat] = useState<ChatWithMembers | null>(null);
    const [messages, setMessages] = useState<ChatMessageI[]>([]);
    const [loading, setLoading] = useState(true);
    const isInitialized = useRef(false);

    useEffect(() => {
        if (!chatId || isInitialized.current) return;
        isInitialized.current = true;

        const numericChatId = parseInt(chatId, 10);

        const loadChat = async () => {
            try {
                const [chatData, messagesData] = await Promise.all([
                    ChatService.getChatById(numericChatId),
                    ChatService.getChatMessages(numericChatId),
                ]);
                setChat(chatData);
                setMessages(messagesData);
            } catch (error) {
                console.error("Failed to load chat:", error);
                navigate(Path.CHATS);
            } finally {
                setLoading(false);
            }
        };

        loadChat();
        chatSocket.connect().then(() => chatSocket.joinChat(numericChatId));

        const messageListener = (message: ChatMessageI) => {
            setMessages(prev => {
                if (prev.some(m => m.messageId === message.messageId)) return prev;
                return [...prev, message];
            });
        };

        const loadChatListener = (chatEvent: ChatI) => {
            if (!chatEvent) {
                navigate(Path.CHATS, { replace: true });
                toast.warn(t("chat.chatDeleted"));
                return;
            }
            if (numericChatId !== chatEvent.chatId) return;
            setChat(prev => prev ? { ...chatEvent, members: prev.members } : null);
        };

        const messageDeletedListener = ({ messageId }: { messageId: number; chatId: number }) => {
            setMessages(prev => prev.filter(m => m.messageId !== messageId));
        };

        chatSocket.registerMessageListener(numericChatId, messageListener);
        chatSocket.registerChatListener(loadChatListener);
        chatSocket.registerMessageDeletedListener(messageDeletedListener);

        return () => {
            chatSocket.unregisterMessageListener(numericChatId);
            chatSocket.unregisterChatListener(loadChatListener);
            chatSocket.unregisterMessageDeletedListener(messageDeletedListener);
            chatSocket.leaveChat(numericChatId);
            isInitialized.current = false;
        };
    }, [chatId]);

    const handleDeleteMessage = async (msg: ChatMessageI) => {
        const confirmed = await confirm({ message: t("chat.deleteMessageConfirm") });
        if (!confirmed) return;
        const response = await chatSocket.deleteMessage({ messageId: msg.messageId, chatId: msg.chatId });
        if (response.error) {
            toast.error(t("chat.error.deleteFailed"));
        }
    };

    return { chat, setChat, messages, loading, setLoading, handleDeleteMessage };
};
