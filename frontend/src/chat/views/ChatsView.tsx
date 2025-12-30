import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatMemberI, ChatResponse } from "@shared/interfaces/ChatI";
import { ChatService } from "../services/ChatService";
import { chatSocket } from "../services/ChatSocketService";
import { useAuthContext } from "auth/AuthProvider";
import Loading from "global/components/Loading";
import { Path } from "../../path";
import { FaComments } from "react-icons/fa";
import ListItem from "global/components/ListItem";
import { AVATAR_MOCK } from "user/components/AvatarTile";
import { Utils } from "global/utils/utils";

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

        const newChatListener = (chat: ChatResponse) => {
            setChats(prev => {
                if (prev.some(c => c.chatId === chat.chatId)) {
                    return prev;
                }
                return [chat, ...prev];
            });
        };

        chatSocket.registerChatListener(newChatListener);
        return () => {
            chatSocket.unregisterChatListener(newChatListener);
        };
    }, []);

    const openChat = (chatId: number) => {
        navigate(Path.getChatPath(chatId));
    };

    const getOtherMember = (chat: ChatResponse) => {
        if (!me || !chat.members) return null;
        return chat.members.find((m: ChatMemberI) => m.uid !== me.uid)?.user;
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
                        const otherUser = getOtherMember(chat);

                        const date = new Date(chat.updatedAt || chat.createdAt) 

                        // TODO dodaj znaczek ze przeczytane/dostarczone
                        const topRight = <div className="small-font">{Utils.prepareDisplayShortDate(t, date)}</div>

                        return <div onClick={() => openChat(chat.chatId)}>
                            <ListItem
                                imgUrl={otherUser?.avatarRef?.url || AVATAR_MOCK}
                                topLeft={otherUser?.displayName || t('chat.unknownUser')}
                                topRight={topRight}
                                bottomLeft={'TODO latest message'}
                                first={index === 0}
                                last={index === chats.length - 1}
                            ></ListItem>
                        </div>



                        // return (
                        //     <div
                        //         key={chat.chatId}
                        //         onClick={() => openChat(chat.chatId)}
                        //         className="p-4 rounded-lg cursor-pointer hover:bg-opacity-80 transition-colors card-bg"
                        //     >
                        //         <div className="flex items-center gap-3">
                        //             <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                        //                 {otherUser?.displayName?.charAt(0)?.toUpperCase() || '?'}
                        //             </div>
                        //             <div>
                        //                 <div className="font-semibold">
                        //                     {otherUser?.displayName || t('chat.unknownUser')}
                        //                 </div>
                        //                 <div className="text-sm secondary-text">
                        //                     {otherUser?.email}
                        //                 </div>
                        //             </div>
                        //         </div>
                        //     </div>
                        // );
                    })}
                </div>
            )}
        </div>
    );
};

export default ChatsView;