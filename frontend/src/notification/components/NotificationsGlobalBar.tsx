import { useEffect, useState } from "react";
import { useUserContext } from "user/UserProvider";
import { NotificationI } from "@shared/interfaces/NotificationI";
import { notificationSocket } from "notification/services/NotificationSocketService";

const NotificationsGlobalBar: React.FC = () => {

    const userCtx = useUserContext();

    const [notifications, setNotifications] = useState<NotificationI[]>([]);

    const socket = notificationSocket
    
    useEffect(() => {
        console.log('NotificationsGlobalBar xxx:')

    }, [])

    if (!notifications.length) {
        return null;
    }

    return <div className="my-1 mx-2 px-2 py-1 secondary-bg">
        <h2 className="text-xl font-bold">{notifications.length} notifications</h2>
    </div>
} 

export default NotificationsGlobalBar;