import { useEffect, useState } from "react";
import { NotificationI } from "@shared/interfaces/NotificationI";
import { notificationSocket } from "notification/services/NotificationSocketService";
import { NotificationService } from "notification/services/NotificationService";
import { useAuthContext } from "auth/AuthProvider";

const NotificationsGlobalBar: React.FC = () => {

    const { me } = useAuthContext();

    const [notifications, setNotifications] = useState<NotificationI[]>([]);

    useEffect(() => {
        if (me) {
            initNotifications();
            notificationSocket.registerReceivedListener(notificationReceived);
            notificationSocket.registerDeletedListener(notificationDeleted);
        } else {
            setNotifications([]);
            notificationSocket.unregisterReceivedListener(notificationReceived);
            notificationSocket.unregisterDeletedListener(notificationDeleted);
        }
    }, [me])

    const initNotifications = async () => {
        const initialNotifications = await NotificationService.getNotifications();
        setNotifications(initialNotifications);
    }

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