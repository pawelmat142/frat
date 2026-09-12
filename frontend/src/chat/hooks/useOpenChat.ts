import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Path } from "../../path";
import { ChatService } from "../services/ChatService";

export const useOpenChat = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return useCallback(async (recipientUid: string) => {
        if (!recipientUid) return;

        try {
            const chat = await ChatService.getOrCreateDirectChat(recipientUid);
            navigate(Path.getConversationPath(chat.chatId));
        } catch (error) {
            console.error('Failed to open chat:', error);
            toast.error(t('chat.error.cannotOpen'));
        }
    }, [navigate, t]);
};