import { ChatI, ChatMemberI, ChatMessageI, ChatWithMembers } from "@shared/interfaces/ChatI";
import { useAuthContext } from "auth/AuthProvider";
import React, { useEffect } from "react";
import { createContext, useRef, useState } from "react";
import { ChatService } from "./services/ChatService";
import { chatSocket } from "./services/ChatSocketService";
import { NotificationI, NotificationIcons, NotificationTypes } from "@shared/interfaces/NotificationI";

interface ChatsContextType {
    chats: ChatWithMembers[],
    unreadMsgNotifications: NotificationI[],
    loading: boolean
}

const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export const ChatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const { me } = useAuthContext();

    const [loading, setLoading] = useState(true)

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

    const onInit = async () => {
        loadChats()
        chatSocket.connect();
        chatSocket.registerChatListener(loadChatListener);
        chatSocket.registerNotificationMessageListener(notificationMessageListener)
    }

    const onDestroy = () => {
        chatSocket.unregisterChatListener(loadChatListener);
        chatSocket.unregisterNotificationMessageListener();
        chatSocket.disconnect();
        setChats([])
        setUnreadMsgNotifications([])
    }

    const loadChats = async () => {
        try {
            setLoading(true)
            const data = await ChatService.getMyChats()
            setChats(data)
            const unreadMSgNotifications = prepareUnreadMsgNotificationsFromChats(data);
            setUnreadMsgNotifications(unreadMSgNotifications)
        } catch (error) {
            console.error('Failed to load chats:', error)
        } finally {
            setLoading(false)
        }
    };

    const loadChatListener = async (chat: ChatI) => {
        setChats(prev => {
            return prev.map(c => {
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
        });
    };



    // CHAT NOTIFICATIONS
    const notificationMessageListener = (message: ChatMessageI) => {
        const unreadMSgNotifications = prepareUnreadMsgNotificationsFromChats(chatsRef.current, message);
        setUnreadMsgNotifications(unreadMSgNotifications)
    }

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

                // TODO translations
                const notification: NotificationI = {
                    notificationId: timestamp + chat.chatId,
                    recipientUid: meChatMember.uid,
                    type: NotificationTypes.NEW_MESSAGE,
                    targetId: chat.chatId.toString(),
                    title: `New message`,
                    message: isCurrentMsg ? message.content : (chat.latestMessageContent || ''),
                    icon: NotificationIcons.CHAT,
                    avatarRef: otherMember.user?.avatarRef,
                    requesterUid: otherMember.user?.uid,
                    requesterName: otherMember.user?.displayName,
                    createdAt: new Date(),
                    readAt: null,
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
        loading,
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