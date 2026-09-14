import React from "react";
import { useParams } from "react-router-dom";
import { useGlobalContext } from "global/providers/GlobalProvider";
import ChatConversationView from "./ChatConversationView";
import ChatsView from "./ChatsView";
import DesktopChatWrapper from "./DesktopChatWrapper";

const ChatRouteView: React.FC = () => {
    const { isDesktop } = useGlobalContext();
    const { chatId } = useParams<{ chatId: string }>();

    if (isDesktop) return <DesktopChatWrapper />;
    return chatId ? <ChatConversationView /> : <ChatsView />;
};

export default ChatRouteView;