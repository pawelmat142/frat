import React, { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import { useChatConversationContext } from "../ChatConversationProvider";
import ChatMessageBubble from "./ChatMessageBubble";
import DateDisplay from "global/components/ui/DateDisplay";
import { DateUtil } from "@shared/utils/DateUtil";
import { MenuItem } from "global/interface/controls.interface";
import { FaCopy } from "react-icons/fa";
import { Ico } from "global/icon.def";
import { ChatMessageI } from "@shared/interfaces/ChatI";
import ContextMenu, { ANIM_DURATION } from "global/components/ui/ContextMenu";
import { toast } from "react-toastify";

interface MenuState {
    position: { x: number; y: number };
    items: MenuItem[];
}

const ChatMessageList: React.FC = () => {
    const { t } = useTranslation();
    const { me } = useUserContext();
    const { chat, messages, blockedByMe, otherUser, messagesEndRef, handleDeleteMessage, historyUnavailable } = useChatConversationContext();
    const [menu, setMenu] = useState<MenuState | null>(null);
    const [closing, setClosing] = useState(false);
    const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pendingMenuRef = useRef<MenuState | null>(null);

    const isEmpty = !messages.length || !!chat?.blockedByUid;

    const dateDisplayProps = {
        todayAsTxt: true,
        yesterdayAsTxt: true,
        displayDayOfWeekIfClose: true,
        t,
        capitalize: false,
    };

    const closeMenu = useCallback(() => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
        pendingMenuRef.current = null;
        setClosing(true);
        closeTimerRef.current = setTimeout(() => {
            setMenu(null);
            setClosing(false);
            closeTimerRef.current = null;
        }, ANIM_DURATION);
    }, []);

    const messageMenuAvailable = (msg: ChatMessageI, isOwn: boolean): boolean => {
        return !!msg.content || isOwn;
    }

    const openMenu = (x: number, y: number, msg: ChatMessageI, isOwn: boolean) => {
        const items: MenuItem[] = [
            {
                label: t('chat.copyMessage'),
                icon: FaCopy,
                if: !!msg.content,
                onClick: () => {
                    navigator.clipboard.writeText(msg.content)
                    toast.info(t('chat.messageCopied'))
                },
            },
            {
                label: t('chat.deleteMessage'),
                icon: Ico.DELETE,
                if: isOwn,
                onClick: () => handleDeleteMessage(msg),
            },
        ];
        const visibleItems = items.filter(item => item.if === undefined || !!item.if);
        if (!visibleItems.length) return;

        const newMenu: MenuState = { position: { x, y }, items };

        if (menu) {
            if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            pendingMenuRef.current = newMenu;
            setClosing(true);
            closeTimerRef.current = setTimeout(() => {
                setMenu(pendingMenuRef.current);
                pendingMenuRef.current = null;
                setClosing(false);
                closeTimerRef.current = null;
            }, ANIM_DURATION);
        } else {
            setMenu(newMenu);
        }
    };

    return (
        <div className="flex-1 overflow-y-auto pb-5">
            {historyUnavailable && (
                <div className="mx-4 mt-4 mb-2 rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
                    {t("chat.e2eHistoryUnavailable")}
                </div>
            )}
            {isEmpty ? (
                <div className="text-center secondary-text py-8">
                    {blockedByMe
                        ? t("chat.blockedByMe")
                        : chat?.blockedByUid
                            ? `${t("chat.blockedByOther")} ${otherUser?.displayName}`
                            : t("chat.noMessages")}
                </div>
            ) : (
                messages.map((msg, index) => {
                    const isOwn = msg.senderUid === me?.uid;
                    const prevMsg = messages[index - 1];
                    const showSeparator = !prevMsg || !DateUtil.isSameDay(prevMsg.createdAt, msg.createdAt);

                    return (
                        <React.Fragment key={msg.messageId}>
                            {showSeparator && (
                                <div className="flex items-center justify-center my-3">
                                    <span className="xs-font secondary-text px-3 py-1 rounded-full bg-black/5 dark:bg-white/10">
                                        {DateDisplay({
                                            date: new Date(msg.createdAt),
                                            ...dateDisplayProps,
                                        })}
                                    </span>
                                </div>
                            )}
                            <div className={`flex  ${isOwn ? "justify-end" : "justify-start"}`}>
                                <ChatMessageBubble
                                    msg={msg}
                                    isOwn={isOwn}
                                    menuAvailable={messageMenuAvailable(msg, isOwn)}
                                    onLongTap={(x, y) => openMenu(x, y, msg, isOwn)}
                                />
                            </div>
                        </React.Fragment>
                    );
                })
            )}
            <div ref={messagesEndRef} />
            {menu && (
                <ContextMenu
                    items={menu.items}
                    position={menu.position}
                    closing={closing}
                    onClose={closeMenu}
                />
            )}
        </div>
    );
};

export default ChatMessageList;
