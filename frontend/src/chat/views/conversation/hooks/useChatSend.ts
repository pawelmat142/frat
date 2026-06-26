import { FormEvent, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { AvatarRef } from "@shared/interfaces/UserI";
import { chatSocket } from "chat/services/ChatSocketService";
import { CloudinaryService } from "user/services/CloudinaryService";
import { PendingAttachment } from "./useChatAttachments";
import ChatCryptoService from "chat/services/ChatCryptoService";

interface UseChatSendParams {
    chatId: string | undefined;
    pendingAttachments: PendingAttachment[];
    clearPendingAttachments: () => void;
    /** Curve25519 public key of the other participant. Required for E2E encryption of text messages. */
    recipientPublicKey: Uint8Array | null;
}

export const useChatSend = ({ chatId, pendingAttachments, clearPendingAttachments, recipientPublicKey }: UseChatSendParams) => {
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
                    pendingAttachments.map(p => p.isImage
                        ? CloudinaryService.uploadChatImage(p.optimizedFile, numericChatId)
                        : CloudinaryService.uploadChatFile(p.file, numericChatId)),
                );
                imageRefs = uploaded.map(r => ({ url: r.url, publicId: r.publicId }));
            }

            const plainText = newMessage.trim();

            // Encrypt text content when E2E is enabled, recipient key is available, and
            // the message has no image attachments (images are uploaded to Cloudinary — not encrypted).
            let content = plainText;
            if (ChatCryptoService.isE2EEnabled() && !imageRefs?.length && recipientPublicKey) {
                const keyPair = ChatCryptoService.loadKeyPair();
                if (keyPair) {
                    content = ChatCryptoService.encrypt(plainText, recipientPublicKey, keyPair.secretKey);
                }
            }

            const response = await chatSocket.sendMessage({
                chatId: numericChatId,
                content,
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
