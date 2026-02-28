import { ChatI, ChatMemberI, ChatMessageI, ChatWithMembers } from "@shared/interfaces/ChatI";
import React, { useEffect } from "react";
import { createContext, useRef, useState } from "react";
import { chatSocket } from "./services/ChatSocketService";
import { NotificationI, NotificationIcons, NotificationTypes } from "@shared/interfaces/NotificationI";
import { useUserContext } from "user/UserProvider";

interface ChatsContextType {
    chats: ChatWithMembers[],
    unreadMsgNotifications: NotificationI[],
}

// TODO bug kiedy otwieram chat z app 1, potem otwieram go z app 2 to na app 2 wybucha

const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export const ChatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const userCtx = useUserContext();
    const { me } = userCtx;

    const [chats, setChats] = useState<ChatWithMembers[]>([])
    const [unreadMsgNotifications, setUnreadMsgNotifications] = useState<NotificationI[]>([])

    const chatsRef = useRef<ChatWithMembers[]>(chats)
    chatsRef.current = chats

    useEffect(() => {
        if (me) {
            onInit()
        } else {
            onDestroy()
        }
        return () => onDestroy()
    }, [me])

    useEffect(() => {
        const unreadMSgNotifications = prepareUnreadMsgNotificationsFromChats(chats);
        setUnreadMsgNotifications(unreadMSgNotifications)
    }, [chats])

    const onDestroy = () => {
        chatSocket.unregisterChatListener(loadChatListener);
        setChats([])
        setUnreadMsgNotifications([])
    }

    const onInit = async () => {
        loadChats()
        chatSocket.registerChatListener(loadChatListener);
    }

    const loadChats = async () => {
        setChats(userCtx.meCtx?.chats || [])
    };


    const loadChatListener = async (chat: ChatI) => {
        setChats(prev => {
            const chatExists = prev.some(c => c.chatId === chat.chatId);
            if (!chatExists) {
                loadChats();
                return prev;
            }
            // Jeśli chat nie istnieje, dodaj go na początek listy
            const newChats = prev.map(c => {
                if (c.chatId === chat.chatId) {
                    // Przepisz members z chat, ale zachowaj user z poprzedniego stanu jeśli istnieje
                    const newMembers = chat.members?.map(newMember => {
                        const oldMember = c.members!.find(m => m.uid === newMember.uid)!;
                        // user musi być zawsze typu UserI (nie undefined)
                        return {
                            ...newMember,
                            user: oldMember.user!
                        };
                    }) || [];
                    return {
                        ...chat,
                        members: newMembers
                    };
                }
                return c;
            }).sort((a, b) => {
                const dateA = new Date(a.updatedAt || a.createdAt).getTime();
                const dateB = new Date(b.updatedAt || b.createdAt).getTime();
                return dateB - dateA;
            });

            return newChats;
        });
    };



    // CHAT NOTIFICATIONS
    const prepareUnreadMsgNotificationsFromChats = (chats: ChatWithMembers[], message?: ChatMessageI): NotificationI[] => {
        const timestamp = Date.now();
        return chats.filter(c => c.members?.some(m => m.user?.uid === me?.uid && m.unreadCount && m.unreadCount > 0))
            .map(chat => {

                const otherMember = chat.members!.find(m => m.user?.uid !== me?.uid);
                if (!otherMember) {
                    throw new Error(`Chat ${chat.chatId} - other memebr not found`);
                }

                const meChatMember = getMeChatMember(chat);

                const isCurrentMsg = message?.chatId === chat.chatId;

                let unreadCount = meChatMember.unreadCount
                if (isCurrentMsg) {
                    unreadCount++
                }

                const notification: NotificationI = {
                    notificationId: timestamp + chat.chatId,
                    recipientUid: meChatMember.uid,
                    type: NotificationTypes.NEW_MESSAGE,
                    targetId: chat.chatId.toString(),
                    title: `notification.newMessageTitle`,
                    message: isCurrentMsg ? message.content : (chat.latestMessageContent || ''),
                    icon: NotificationIcons.CHAT,
                    avatarRef: otherMember.user?.avatarRef,
                    requesterUid: otherMember.user?.uid,
                    requesterName: otherMember.user?.displayName,
                    createdAt: new Date(),
                    readAt: null,
                    metadata: { unreadCount }
                }
                return notification
            })
    }

    const getMeChatMember = (chat: ChatWithMembers): ChatMemberI => {
        const meChatMembet: ChatMemberI | null = chat.members!.find(m => m.user?.uid === me?.uid) || null;
        if (!meChatMembet) {
            throw new Error(`Current user is not a member of chatId ${chat.chatId}`);
        }
        return meChatMembet;
    }


    return <ChatsContext.Provider value={{
        chats,
        unreadMsgNotifications,
    }}>
        {children}
    </ChatsContext.Provider>
}

/**
 * Hook do dostępu do kontekstu cható usera
 */
export const useChatsContext = () => {
    const context = React.useContext(ChatsContext);
    if (!context) {
        throw new Error("useChatsContext must be used within a ChatsProvider");
    }
    return context;
}