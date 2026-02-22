import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatMemberWithUserI, ChatWithMembers } from "@shared/interfaces/ChatI";
import { useAuthContext } from "auth/AuthProvider";
import Loading from "global/components/Loading";
import { Path } from "../../path";
import { FaComments } from "react-icons/fa";
import ChatListItem from "./ChatListItem";
import { useChatsContext } from "chat/ChatsProvider";

const ChatsView: React.FC = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { me } = useAuthContext()
    const chatCtx = useChatsContext()  

    useEffect(() => {}, [chatCtx.chats]) 

    const openChat = (chatId: number) => {
        navigate(Path.getChatPath(chatId));
    };

    const getOtherMember = (chat: ChatWithMembers): ChatMemberWithUserI | null | undefined => {
        if (!me || !chat.members) return null;
        return chat.members.find((m: ChatMemberWithUserI) => m.uid !== me.uid);
    };

    if (chatCtx.loading) {
        return <Loading />;
    }

    return (
        <div className="list-view">
            {chatCtx.chats.length === 0 ? (
                <div className="text-center secondary-text py-8">
                    <FaComments className="mx-auto text-4xl mb-2 opacity-50" />
                    <p>{t('chat.noChats')}</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {chatCtx.chats.map((chat, index) => {
                        const otherMember = getOtherMember(chat);
                        if (!otherMember) return null;
                        return <div onClick={() => openChat(chat.chatId)} key={chat.chatId}>
                            <ChatListItem
                                chat={chat}
                                otherMember={otherMember}
                                first={index === 0}
                                last={index === chatCtx.chats.length - 1}
                            ></ChatListItem>
                        </div>
                    })}
                </div>
            )}
        </div>
    );
};

export default ChatsView;