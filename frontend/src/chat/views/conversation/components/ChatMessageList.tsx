import React from "react";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import { useChatConversationContext } from "../ChatConversationProvider";
import ChatMessageBubble from "./ChatMessageBubble";

const ChatMessageList: React.FC = () => {
    const { t } = useTranslation();
    const { me } = useUserContext();
    const { chat, messages, blockedByMe, otherUser, messagesEndRef, handleDeleteMessage, historyUnavailable } = useChatConversationContext();

    const isEmpty = !messages.length || !!chat?.blockedByUid;

    return (
        <div className="flex-1 overflow-y-auto pb-5">
            {historyUnavailable && (
                <div className="mx-4 mt-4 mb-2 rounded-lg border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 px-4 py-3 text-sm text-yellow-800 dark:text-yellow-300">
                    {/* TODO: add translation key — chat.e2eHistoryUnavailable */}
                    🔒 Chat history is not available on this device due to E2E encryption.
                    Import your encryption key in Settings to restore access.
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
                messages.map(msg => {
                    const isOwn = msg.senderUid === me?.uid;
                    return (
                        <div key={msg.messageId} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                            <ChatMessageBubble
                                msg={msg}
                                isOwn={isOwn}
                                onDelete={() => handleDeleteMessage(msg)}
                            />
                        </div>
                    );
                })
            )}
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatMessageList;
