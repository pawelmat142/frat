import { FormEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AvatarRef } from "@shared/interfaces/UserI";
import { chatSocket } from "chat/services/ChatSocketService";
import { CloudinaryService } from "user/services/CloudinaryService";
import { PendingAttachment } from "./useChatAttachments";

interface UseChatSendParams {
    chatId: string | undefined;
    pendingAttachments: PendingAttachment[];
    clearPendingAttachments: () => void;
}

export const useChatSend = ({ chatId, pendingAttachments, clearPendingAttachments }: UseChatSendParams) => {
    const { t } = useTranslation();

    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !pendingAttachments.length) || !chatId || sending) return;

        const numericChatId = parseInt(chatId, 10);
        setSending(true);

        try {
            let imageRefs: AvatarRef[] | undefined;

            if (pendingAttachments.length) {
                const uploaded = await Promise.all(
                    pendingAttachments.map(p => CloudinaryService.uploadChatImage(p.optimizedFile, numericChatId)),
                );
                imageRefs = uploaded.map(r => ({ url: r.url, publicId: r.publicId }));
            }

            const response = await chatSocket.sendMessage({
                chatId: numericChatId,
                content: newMessage.trim(),
                imageRefs,
            });

            if (response.success && response.message) {
                setNewMessage("");
                clearPendingAttachments();
                inputRef.current?.focus();
            }
        } catch (error) {
            console.error("Failed to send message:", error);
            toast.error(t("chat.error.sendFailed"));
        } finally {
            setSending(false);
        }
    };

    return {
        newMessage,
        setNewMessage,
        sending,
        inputFocused,
        setInputFocused,
        handleSendMessage,
        inputRef,
    };
};
