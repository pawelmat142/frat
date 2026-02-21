import { useEffect, useState } from "react";
import { NotificationI } from "@shared/interfaces/NotificationI";
import { useLocation, useNavigate } from "react-router-dom";
import { Path } from "../../path";
import { useUserContext } from "user/UserProvider";
import { FaBell } from "react-icons/fa";
import { useTranslation } from "react-i18next";

const NotificationsGlobalBar: React.FC = () => {

    const userCtx = useUserContext();
    const navigate = useNavigate()
    const location = useLocation();
    const { t } = useTranslation();

    const [notifications, setNotifications] = useState<NotificationI[]>([])
    const [hideSection, setHideSection] = useState(false)

    // TODO if 1 notification - show it on global bar, if more
    // TODO mark as read, delete, etc
    // TODO notifications counter global state
    // TODO notification appear animation

    useEffect(() => {
        setNotifications(userCtx.notifications)
    }, [userCtx.notifications])

    useEffect(() => {
        if (hideSection) {
            if (!location.pathname.includes(Path.NOTIFICATIONS)) {
                setHideSection(false)
            }
        } else {
            if (location.pathname.includes(Path.NOTIFICATIONS)) {
                setHideSection(true)
            }
        }
    }, [location.pathname])

    const unreadCount = notifications?.filter(n => n.readAt == null).length

    if (!unreadCount || hideSection) {
        return null;
    }

    const getMessage = () => {
        let key = unreadCount === 1
            ? 'notification.unreadNotificationsOne'
            : unreadCount > 1 && unreadCount < 5
                ? 'notification.unreadNotificationsFew'
                : 'notification.unreadNotificationsMany'
        return t(key, { count: unreadCount })   
    }

    return <div className="my-1 mx-2 px-3 py-2 rounded-md secondary-bg rippple notification-bar" onClick={() => navigate(Path.NOTIFICATIONS)}>
        <div className="flex items-center gap-3 primary-color">
            <FaBell size={32}></FaBell>
            <h2 className="font-bold">{getMessage()}</h2>
        </div>
    </div>
}

export default NotificationsGlobalBar;