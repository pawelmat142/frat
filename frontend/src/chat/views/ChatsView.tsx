import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatMemberI, ChatMemberWithUserI, ChatResponse } from "@shared/interfaces/ChatI";
import { ChatService } from "../services/ChatService";
import { chatSocket } from "../services/ChatSocketService";
import { useAuthContext } from "auth/AuthProvider";
import Loading from "global/components/Loading";
import { Path } from "../../path";
import { FaComments } from "react-icons/fa";
import { UserI } from "@shared/interfaces/UserI";
import ChatListItem from "./ChatListItem";

const ChatsView: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { me } = useAuthContext();
    const [chats, setChats] = useState<ChatResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadChats = async () => {
            try {
                const data = await ChatService.getMyChats();
                setChats(data);
            } catch (error) {
                console.error('Failed to load chats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadChats()
        console.log(chats)
        chatSocket.connect();

        const loadChatListener = async (chat: ChatResponse) => {
            if (!chat) {
                const data = await ChatService.getMyChats();
                setChats(data);
                return
            }
            setChats(prev => {
                return [...prev.filter(c => c.chatId !== chat.chatId), chat].sort((a, b) => {
                    const dateA = new Date(a.updatedAt || a.createdAt).getTime();
                    const dateB = new Date(b.updatedAt || b.createdAt).getTime();
                    return dateB - dateA;
                });
            });
        };

        chatSocket.registerChatListener(loadChatListener);
        return () => {
            chatSocket.unregisterChatListener(loadChatListener);
        };
    }, []);

    const openChat = (chatId: number) => {
        navigate(Path.getChatPath(chatId));
    };

    const getOtherMember = (chat: ChatResponse): ChatMemberWithUserI | null | undefined => {
        if (!me || !chat.members) return null;
        return chat.members.find((m: ChatMemberWithUserI) => m.uid !== me.uid);
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="list-view">
            {chats.length === 0 ? (
                <div className="text-center secondary-text py-8">
                    <FaComments className="mx-auto text-4xl mb-2 opacity-50" />
                    <p>{t('chat.noChats')}</p>
                </div>
            ) : (
                <div className="flex flex-col">
                    {chats.map((chat, index) => {
                        const otherMember = getOtherMember(chat);
                        if (!otherMember) return null;
                        return <div onClick={() => openChat(chat.chatId)} key={chat.chatId}>
                            <ChatListItem
                                chat={chat}
                                otherMember={otherMember}
                                first={index === 0}
                                last={index === chats.length - 1}
                            ></ChatListItem>
                        </div>
                    })}
                </div>
            )}
        </div>
    );
};

export default ChatsView;