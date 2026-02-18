import { useEffect, useState } from "react";
import { useUserContext } from "user/UserProvider";
import { NotificationI } from "@shared/interfaces/NotificationI";
import { notificationSocket } from "notification/services/NotificationSocketService";

const NotificationsGlobalBar: React.FC = () => {

    const [notifications, setNotifications] = useState<NotificationI[]>([]);

    useEffect(() => {
        notificationSocket.registerReceivedListener(notificationReceived);
        notificationSocket.registerDeletedListener(notificationDeleted);
    }, [])

    const notificationReceived = (notification: NotificationI) => {
        const exists = notifications.find(n => n.notificationId === notification.notificationId);
        if (exists) {
            setNotifications(prev => prev.map(n => n.notificationId === notification.notificationId ? notification : n));
            return;
        }
        setNotifications(prev => [...prev, notification]);
    }

    const notificationDeleted = (notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
    }

    console.log('notifications:', notifications);

    if (!notifications.length) {
        return null;
    }

    return <div className="my-1 mx-2 px-2 py-1 secondary-bg">
        <h2 className="text-xl font-bold">{notifications.length} notifications</h2>
    </div>
} 

export default NotificationsGlobalBar;