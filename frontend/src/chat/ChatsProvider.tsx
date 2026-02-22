import { ChatI, ChatMessageI, ChatWithMembers } from "@shared/interfaces/ChatI";
import { useAuthContext } from "auth/AuthProvider";
import React from "react";
import { createContext, useState } from "react";
import { ChatService } from "./services/ChatService";
import { chatSocket } from "./services/ChatSocketService";
import { set } from "react-hook-form";

interface ChatsContextType {
    chats: ChatWithMembers[],
    loading: boolean
}

const ChatsContext = createContext<ChatsContextType | undefined>(undefined);

export const ChatsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const authCtx = useAuthContext();
    const [chats, setChats] = useState<ChatWithMembers[]>([])
    const [loading, setLoading] = useState(true)

    React.useEffect(() => {
        onInit()

        return () => onDestroy()
    }, [authCtx.me])

    const onInit = async () => {
        if (!authCtx.me) {
            onDestroy()
            return;
        }
        loadChats()
        chatSocket.connect();
        chatSocket.registerChatListener(loadChatListener);
        chatSocket.registerNotificationMessageListener(notificationMessageListener);
    }

    const onDestroy = () => {
        chatSocket.unregisterChatListener(loadChatListener);
        chatSocket.unregisterNotificationMessageListener();
        chatSocket.disconnect();
        setChats([])
    }

    const loadChats = async () => {
        try {
            setLoading(true)
            const data = await ChatService.getMyChats()
            setChats(data)
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

    const notificationMessageListener = (message: ChatMessageI) => {
        // TODO regenerate notifications
        console.log('Notification about new message in chatId', message.chatId)
    }

    return <ChatsContext.Provider value={{ chats, loading }}>
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