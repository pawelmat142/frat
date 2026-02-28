import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChatMemberWithUserI, ChatWithMembers } from "@shared/interfaces/ChatI";
import Loading from "global/components/Loading";
import { Path } from "../../path";
import ChatListItem from "./ChatListItem";
import { useChatsContext } from "chat/ChatsProvider";
import { Ico } from "global/icon.def";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import { useUserContext } from "user/UserProvider";

const ChatsView: React.FC = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const { me } = useUserContext()
    const chatCtx = useChatsContext()

    useEffect(() => { }, [chatCtx.chats])

    const openChat = (chatId: number) => {
        navigate(Path.getConversationPath(chatId));
    };

    const getOtherMember = (chat: ChatWithMembers): ChatMemberWithUserI | null | undefined => {
        if (!me || !chat.members) return null;
        return chat.members.find((m: ChatMemberWithUserI) => m.uid !== me.uid);
    };

    if (!me) {
        return <Loading />;
    }

    return (
        <div className="list-view">
            {chatCtx.chats.length === 0 ? (
                <>
                    <div className="text-center secondary-text py-8">
                        <Ico.CHAT className="mx-auto text-4xl mb-2 opacity-50" />
                        <p>{t('chat.noChats')}</p>
                    </div>

                    <div className="flex flex-col gap-3 mt-6 px-5">
                        <Button
                            fullWidth
                            mode={BtnModes.SECONDARY}
                            onClick={() => navigate(Path.FRIENDS_SEARCH)}
                        >
                            <Ico.SEARCH className="mr-2" />
                            {t('friends.search')}
                        </Button>
                    </div>
                </>
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