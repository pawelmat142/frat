import { useEffect, useState } from "react";
import { NotificationI } from "@shared/interfaces/NotificationI";
import { useLocation, useNavigate } from "react-router-dom";
import { Path } from "../../path";
import { FaBell } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNotificationsContext } from "notification/NotificationsProvider";

const NotificationsGlobalBar: React.FC = () => {

    const notificationsCtx = useNotificationsContext();
    const navigate = useNavigate()
    const location = useLocation();
    const { t } = useTranslation();

    const [notifications, setNotifications] = useState<NotificationI[]>([])
    const [hideSection, setHideSection] = useState(false)

    // TODO notification appear animation
    // TODO nav from notification to chat

    useEffect(() => {
        setNotifications(notificationsCtx.notifications)
    }, [notificationsCtx.notifications])

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
            <FaBell size={24}></FaBell>
            <h2 className="">{getMessage()}</h2>
        </div>
    </div>
}

export default NotificationsGlobalBar;