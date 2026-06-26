import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatMessageI, ChatWithMembers } from "@shared/interfaces/ChatI";
import { UserI } from "@shared/interfaces/UserI";
import { MenuItem } from "global/interface/controls.interface";
import { useUserContext } from "user/UserProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";
import { ChatService } from "chat/services/ChatService";
import { Path } from "../../../path";
import { useChatConversation } from "./hooks/useChatConversation";
import { useChatAttachments, PendingAttachment } from "./hooks/useChatAttachments";
import { useChatSend } from "./hooks/useChatSend";

interface ChatConversationContextType {
    chat: ChatWithMembers | null;
    messages: ChatMessageI[];
    loading: boolean;
    otherUser: UserI | null;
    blockedByMe: boolean;
    chatMenu: MenuItem[];
    handleDeleteMessage: (msg: ChatMessageI) => Promise<void>;
    pendingAttachments: PendingAttachment[];
    optimizing: boolean;
    imageInputRef: React.RefObject<HTMLInputElement>;
    fileInputRef: React.RefObject<HTMLInputElement>;
    handleImagesSelected: (files: FileList) => Promise<void>;
    handleFilesSelected: (files: FileList) => Promise<void>;
    removePendingAttachment: (index: number) => void;
    clearPendingAttachments: () => void;
    newMessage: string;
    setNewMessage: (msg: string) => void;
    sending: boolean;
    inputFocused: boolean;
    setInputFocused: (f: boolean) => void;
    handleSendMessage: (e: React.FormEvent) => Promise<void>;
    inputRef: React.RefObject<HTMLInputElement>;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    scrollToBottom: () => void;
    /** True when all loaded messages are E2E-encrypted but cannot be decrypted on this device.
     *  When true, the message list is empty and a single info banner is shown instead. */
    historyUnavailable: boolean;
}

const ChatConversationContext = createContext<ChatConversationContextType | undefined>(undefined);

export const ChatConversationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { chatId } = useParams<{ chatId: string }>();
    const { me } = useUserContext();
    const globalCtx = useGlobalContext();
    const confirm = useConfirm();

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    const { chat, messages, loading, setLoading, handleDeleteMessage, recipientPublicKey, historyUnavailable } =
        useChatConversation(chatId, me?.uid);
    const { pendingAttachments, optimizing, imageInputRef, fileInputRef, handleImagesSelected, handleFilesSelected, removePendingAttachment, clearPendingAttachments } =
        useChatAttachments(messages);
    const { newMessage, setNewMessage, sending, inputFocused, setInputFocused, handleSendMessage, inputRef } =
        useChatSend({ chatId, pendingAttachments, clearPendingAttachments, recipientPublicKey });

    const otherUser = useMemo(
        () => chat?.members?.find(m => m.uid !== me?.uid)?.user ?? null,
        [chat, me],
    );
    const blockedByMe = chat?.blockedByUid === me?.uid;

    const chatMenu = useMemo((): MenuItem[] => {
        if (!chat) return [];
        const items: MenuItem[] = [];
        if (!chat.blockedByUid) {
            items.push({ label: t("account.showProfile"), onClick: () => navigate(Path.getProfilePath(otherUser?.uid || "")) });
            if (messages.length) {
                items.push({
                    label: t("chat.cleanChat"),
                    onClick: async () => {
                        if (!await confirm({ message: t("chat.cleanChatConfirm") })) return;
                        setLoading(true);
                        await ChatService.cleanChat(chat.chatId);
                        setLoading(false);
                        toast.success(t("chat.cleanChatSuccess"));
                    },
                });
            }
            items.push({
                label: t("chat.blockUser"),
                onClick: async () => {
                    if (!await confirm({ message: t("chat.blockUserConfirm") })) return;
                    setLoading(true);
                    await ChatService.blockChat(chat.chatId);
                    setLoading(false);
                    toast.success(t("chat.blockUserSuccess"));
                },
            });
        } else if (chat.blockedByUid === me?.uid) {
            items.push({
                label: t("chat.unblockUser"),
                onClick: async () => {
                    if (!await confirm({ message: t("chat.unblockUserConfirm") })) return;
                    setLoading(true);
                    await ChatService.unblockChat(chat.chatId);
                    setLoading(false);
                    toast.success(t("chat.unblockUserSuccess"));
                },
            });
        }
        if (chat.blockedByUid !== me?.uid) {
            items.push({
                label: t("chat.deleteChat"),
                onClick: async () => {
                    if (!await confirm({ message: t("chat.deleteChatConfirm") })) return;
                    setLoading(true);
                    await ChatService.deleteChat(chat.chatId);
                    setLoading(false);
                },
            });
        }
        return items;
    }, [chat, messages.length, otherUser, me]);

    useEffect(() => { globalCtx.hideFooter(); return () => globalCtx.showFooter(); }, []);
    useEffect(() => { scrollToBottom(); }, [messages]);
    useEffect(() => {
        const viewport = window.visualViewport;
        if (!viewport) return;
        viewport.addEventListener("resize", scrollToBottom);
        return () => viewport.removeEventListener("resize", scrollToBottom);
    }, []);

    return (
        <ChatConversationContext.Provider value={{
            chat, messages, loading, otherUser, blockedByMe, chatMenu, handleDeleteMessage,
            pendingAttachments, optimizing, imageInputRef, fileInputRef, handleImagesSelected, handleFilesSelected, removePendingAttachment, clearPendingAttachments,
            newMessage, setNewMessage, sending, inputFocused, setInputFocused, handleSendMessage, inputRef,
            messagesEndRef, scrollToBottom,
            historyUnavailable,
        }}>
            {children}
        </ChatConversationContext.Provider>
    );
};

export const useChatConversationContext = () => {
    const ctx = useContext(ChatConversationContext);
    if (!ctx) throw new Error("useChatConversationContext must be used within ChatConversationProvider");
    return ctx;
};
