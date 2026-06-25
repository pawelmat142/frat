import React from "react";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import { useChatConversationContext } from "../ChatConversationProvider";
import ChatMessageBubble from "./ChatMessageBubble";

const ChatMessageList: React.FC = () => {
    const { t } = useTranslation();
    const { me } = useUserContext();
    const { chat, messages, blockedByMe, otherUser, messagesEndRef, handleDeleteMessage } = useChatConversationContext();

    const isEmpty = !messages.length || !!chat?.blockedByUid;

    return (
        <div className="flex-1 overflow-y-auto pb-5">
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
