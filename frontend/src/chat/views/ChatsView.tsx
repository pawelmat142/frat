import React from "react";
import { useTranslation } from "react-i18next";
import Header from "global/components/Header";
import ChatListPanel from "./ChatListPanel";

const ChatsView: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <Header title={t("chat.chats")} />
            <ChatListPanel />
        </>
    );
};

export default ChatsView;