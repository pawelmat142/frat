import React from "react";
import { useTranslation } from "react-i18next";
import Header from "global/components/Header";
import HeaderBackBtn from "global/header-state/HeaderBackBtn";
import UserItem from "user/components/UserItem";
import { useChatConversationContext } from "../ChatConversationProvider";

const ChatConversationHeader: React.FC = () => {
    const { t } = useTranslation();
    const { chat, otherUser, chatMenu } = useChatConversationContext();

    if (!chat || !otherUser) return null;

    return (
        <div className="sticky-header">
            <Header
                leftBtn={
                    <div className="flex gap-2 items-center">
                        <HeaderBackBtn />
                        <UserItem user={otherUser} size={2.5} />
                    </div>
                }
                menu={{ title: t("chat.chatMenu"), items: chatMenu }}
            />
        </div>
    );
};

export default ChatConversationHeader;
