import React from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";
import ChatConversationView from "./ChatConversationView";
import ChatListPanel from "./ChatListPanel";

const DesktopChatEmptyState: React.FC = () => {
    const { t } = useTranslation();

    return <div className="desktop-chat-empty-state">
        {t("chat.selectChat", "Select a chat to start messaging")}
    </div>;
};

const DesktopChatWrapper: React.FC = () => {
    const { chatId } = useParams<{ chatId: string }>();

    return (
        <div className="desktop-chat-layout">
            <aside className="desktop-chat-list">
                <ChatListPanel selectedChatId={chatId} showSearch />
            </aside>
            <main className="desktop-chat-conversation">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={chatId || "empty"}
                        className="desktop-chat-conversation-content"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                        {chatId ? <ChatConversationView /> : <DesktopChatEmptyState />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default DesktopChatWrapper;