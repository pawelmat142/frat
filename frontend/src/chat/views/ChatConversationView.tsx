import React from "react";
import Loading from "global/components/Loading";
import { ChatConversationProvider, useChatConversationContext } from "./conversation/ChatConversationProvider";
import ChatConversationHeader from "./conversation/components/ChatConversationHeader";
import ChatMessageList from "./conversation/components/ChatMessageList";
import ChatAttachmentPreview from "./conversation/components/ChatAttachmentPreview";
import ChatInputForm from "./conversation/components/ChatInputForm";

const ChatConversationContent: React.FC = () => {
    const { loading } = useChatConversationContext();
    if (loading) return <Loading />;
    return (
        <>
            <ChatConversationHeader />
            <div className="chat-view">
                <ChatMessageList />
                <ChatAttachmentPreview />
                <ChatInputForm />
            </div>
        </>
    );
};

const ChatConversationView: React.FC = () => (
    <ChatConversationProvider>
        <ChatConversationContent />
    </ChatConversationProvider>
);

export default ChatConversationView;
