import { NotificationI } from "@shared/interfaces/NotificationI";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { notificationSocket } from "./services/NotificationSocketService";
import { NotificationService } from "./services/NotificationService";
import { useChatsContext } from "chat/ChatsProvider";
import { NativeNotificationService } from "./services/NativeNotificationService";
import { useUserContext } from "user/UserProvider";

interface NotificationsContextType {
    loading: boolean;
    notifications: NotificationI[];
    notificationDeleted: (notificationId: number) => void;
    notificationReceived: (notification: NotificationI) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const { me } = useUserContext()
    const chatsCtx = useChatsContext();

    const [loading, setLoading] = useState<boolean>(false)

    // Notifications stored in database
    const [nativeNotifications, setNativeNotifications] = useState<NotificationI[]>([])

    // All notifications merged and sorted by createdAt
    const [notifications, setNotifications] = useState<NotificationI[]>([])

    useEffect(() => {
        if (me) {
            onInit()
        } else {
            onDestroy()
        }
        return () => onDestroy()
    }, [me])

    useEffect(() => {
        setNotifications([...nativeNotifications, ...chatsCtx.unreadMsgNotifications])
    }, [chatsCtx.unreadMsgNotifications, nativeNotifications])

    // Native browser notification - update on unread count change
    const prevUnreadCount = useRef<number>(0)
    useEffect(() => {
        const unreadCount = notifications.filter(n => !n.readAt).length
        if (unreadCount !== prevUnreadCount.current) {
            prevUnreadCount.current = unreadCount
            NativeNotificationService.updateUnreadNotification(unreadCount)
        }
    }, [notifications])

    const onInit = async () => {
        NativeNotificationService.requestPermission()
        initNativeNotifications()
        registerNativeNotificationListeners()
    }

    const onDestroy = () => {
        unregisterNativeNotificationListeners()
        setNativeNotifications([])
    }

    const initNativeNotifications = async () => {
        try {
            setLoading(true);
            const initialNotifications = await NotificationService.getNotifications()
            setNativeNotifications(initialNotifications)
        } catch (error) {
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }

    const registerNativeNotificationListeners = () => {
        notificationSocket.registerReceivedListener(notificationReceived)
        notificationSocket.registerDeletedListener(notificationDeleted)
    }

    const unregisterNativeNotificationListeners = () => {
        notificationSocket.unregisterReceivedListener(notificationReceived)
        notificationSocket.unregisterDeletedListener(notificationDeleted)
    }

    const notificationReceived = (notification: NotificationI) => {
        const exists = nativeNotifications.find(n => n.notificationId === notification.notificationId)
        if (exists) {
            setNativeNotifications(prev => prev.map(n => n.notificationId === notification.notificationId ? notification : n))
            return;
        }
        setNativeNotifications(prev => [...prev, notification])
    }

    const notificationDeleted = (notificationId: number) => {
        setNativeNotifications(prev => prev.filter(n => n.notificationId !== notificationId))
    }

    return (<NotificationsContext.Provider value={{
        loading: loading,
        notifications,
        notificationDeleted,
        notificationReceived
    }}>{children}</NotificationsContext.Provider>)
}

/**
 * Hook do dostępu do kontekstu użytkownika
 */
export const useNotificationsContext = (): NotificationsContextType => {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotificationsContext must be used within NotificationsProvider');
    }
    return context;
};