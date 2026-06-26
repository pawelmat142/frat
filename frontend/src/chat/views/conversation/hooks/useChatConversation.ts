import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatI, ChatMessageI, ChatWithMembers, MessageTypes } from "@shared/interfaces/ChatI";
import { ChatService } from "chat/services/ChatService";
import { chatSocket } from "chat/services/ChatSocketService";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";
import { Path } from "../../../../path";
import ChatCryptoService from "chat/services/ChatCryptoService";

/** Decrypts a single message content in-place. Returns a mutated copy of the message.
 *  If decryption fails (wrong device key), content is replaced with a safe fallback.
 *  Images are never decrypted — only TEXT content with the 'e2e:' prefix is touched. */
const decryptMessage = (
    msg: ChatMessageI,
    recipientPublicKey: Uint8Array,
    mySecretKey: Uint8Array,
): ChatMessageI => {
    if (msg.type !== MessageTypes.TEXT || !ChatCryptoService.isE2EContent(msg.content)) return msg;
    const plain = ChatCryptoService.decrypt(msg.content, recipientPublicKey, mySecretKey);
    // TODO: add translation key for the fallback text
    return { ...msg, content: plain ?? '🔒 Message could not be decrypted.' };
};

export const useChatConversation = (chatId: string | undefined, meUid: string | undefined) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const confirm = useConfirm();

    const [chat, setChat] = useState<ChatWithMembers | null>(null);
    const [messages, setMessages] = useState<ChatMessageI[]>([]);
    const [loading, setLoading] = useState(true);
    /** Curve25519 public key of the other participant, fetched once per chat open. */
    const [recipientPublicKey, setRecipientPublicKey] = useState<Uint8Array | null>(null);
    /** True when all loaded messages are encrypted but cannot be decrypted on this device. */
    const [historyUnavailable, setHistoryUnavailable] = useState(false);

    const recipientPublicKeyRef = useRef<Uint8Array | null>(null);
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

                // ── E2E: fetch recipient public key and decrypt history ──────────────
                if (ChatCryptoService.isE2EEnabled() && meUid) {
                    const otherMemberUid = chatData.members.find(m => m.uid !== meUid)?.uid;
                    const keyPair = ChatCryptoService.loadKeyPair();

                    if (otherMemberUid && keyPair) {
                        const pubKey = await ChatCryptoService.getRecipientPublicKey(otherMemberUid);
                        if (pubKey) {
                            setRecipientPublicKey(pubKey);
                            recipientPublicKeyRef.current = pubKey;

                            const decrypted = messagesData.map(m => decryptMessage(m, pubKey, keyPair.secretKey));

                            // If every TEXT message failed to decrypt → history unavailable on this device
                            const textMessages = decrypted.filter(m => m.type === MessageTypes.TEXT);
                            const allUndecryptable = textMessages.length > 0 &&
                                // TODO: add translation key for the fallback text used below
                                textMessages.every(m => m.content === '🔒 Message could not be decrypted.');

                            setHistoryUnavailable(allUndecryptable);
                            setMessages(allUndecryptable ? [] : decrypted);
                            return;
                        }
                    }
                }
                // ────────────────────────────────────────────────────────────────────
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
            // Decrypt real-time incoming messages on the fly using the cached ref
            const keyPair = ChatCryptoService.isE2EEnabled() ? ChatCryptoService.loadKeyPair() : null;
            const pubKey = recipientPublicKeyRef.current;
            const resolved = (keyPair && pubKey)
                ? decryptMessage(message, pubKey, keyPair.secretKey)
                : message;

            setMessages(prev => {
                if (prev.some(m => m.messageId === resolved.messageId)) return prev;
                // If history was unavailable, a new decryptable message opens the conversation
                setHistoryUnavailable(false);
                return [...prev, resolved];
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
            recipientPublicKeyRef.current = null;
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

    return { chat, setChat, messages, loading, setLoading, handleDeleteMessage, recipientPublicKey, historyUnavailable };
};
