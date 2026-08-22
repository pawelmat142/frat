import React from "react";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import { useChatConversationContext } from "../ChatConversationProvider";
import ChatMessageBubble from "./ChatMessageBubble";
import DateDisplay from "global/components/ui/DateDisplay";
import { DateUtil } from "@shared/utils/DateUtil";
import { MenuGroup, MenuItem } from "global/interface/controls.interface";
import { FaCopy } from "react-icons/fa";
import { Ico } from "global/icon.def";
import { ChatMessageI } from "@shared/interfaces/ChatI";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { toast } from "react-toastify";

const ChatMessageList: React.FC = () => {
    const { t } = useTranslation();
    const { me } = useUserContext();
    const { chat, messages, blockedByMe, otherUser, messagesEndRef, handleDeleteMessage, historyUnavailable } = useChatConversationContext();
    const { openContextMenu } = useGlobalContext();

    const isEmpty = !messages.length || !!chat?.blockedByUid;

    const dateDisplayProps = {
        todayAsTxt: true,
        yesterdayAsTxt: true,
        displayDayOfWeekIfClose: true,
        t,
        capitalize: false,
    };

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
        const groups: MenuGroup[] = [{ items }];
        openContextMenu({ x, y }, groups);
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
        </div>
    );
};

export default ChatMessageList;
