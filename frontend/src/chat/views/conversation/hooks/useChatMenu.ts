import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { ChatWithMembers } from "@shared/interfaces/ChatI";
import { UserI } from "@shared/interfaces/UserI";
import { MenuItem } from "global/interface/controls.interface";
import { useUserContext } from "user/UserProvider";
import { useConfirm } from "global/providers/PopupProvider";
import { ChatService } from "chat/services/ChatService";
import { Path } from "../../../../path";

interface Params {
    chat: ChatWithMembers | null;
    otherUser: UserI | null;
    messageCount: number;
    setLoading?: (loading: boolean) => void;
}

export const useChatMenu = ({ chat, otherUser, messageCount, setLoading }: Params): MenuItem[] => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { me } = useUserContext();
    const confirm = useConfirm();

    return useMemo(() => {
        if (!chat) return [];
        const withLoading = async (action: () => Promise<unknown>) => {
            setLoading?.(true);
            try {
                await action();
            } finally {
                setLoading?.(false);
            }
        };
        const items: MenuItem[] = [];

        if (!chat.blockedByUid) {
            items.push({ label: t("account.showProfile"), onClick: () => navigate(Path.getProfilePath(otherUser?.uid || "")) });
            if (messageCount) {
                items.push({
                    label: t("chat.cleanChat"),
                    onClick: async () => {
                        if (!await confirm({ message: t("chat.cleanChatConfirm") })) return;
                        await withLoading(() => ChatService.cleanChat(chat.chatId));
                        toast.success(t("chat.cleanChatSuccess"));
                    },
                });
            }
            items.push({
                label: t("chat.blockUser"),
                onClick: async () => {
                    if (!await confirm({ message: t("chat.blockUserConfirm") })) return;
                    await withLoading(() => ChatService.blockChat(chat.chatId));
                    toast.success(t("chat.blockUserSuccess"));
                },
            });
        } else if (chat.blockedByUid === me?.uid) {
            items.push({
                label: t("chat.unblockUser"),
                onClick: async () => {
                    if (!await confirm({ message: t("chat.unblockUserConfirm") })) return;
                    await withLoading(() => ChatService.unblockChat(chat.chatId));
                    toast.success(t("chat.unblockUserSuccess"));
                },
            });
        }

        if (chat.blockedByUid !== me?.uid) {
            items.push({
                label: t("chat.deleteChat"),
                onClick: async () => {
                    if (!await confirm({ message: t("chat.deleteChatConfirm") })) return;
                    await withLoading(() => ChatService.deleteChat(chat.chatId));
                },
            });
        }
        return items;
    }, [chat, confirm, me, messageCount, navigate, otherUser, setLoading, t]);
};