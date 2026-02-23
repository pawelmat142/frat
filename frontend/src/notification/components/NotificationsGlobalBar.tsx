import { useEffect, useState } from "react";
import { NotificationI } from "@shared/interfaces/NotificationI";
import { useLocation, useNavigate } from "react-router-dom";
import { Path } from "../../path";
import { FaBell } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useNotificationsContext } from "notification/NotificationsProvider";
import { AnimatePresence, motion } from "framer-motion";

const NotificationsGlobalBar: React.FC = () => {

    const notificationsCtx = useNotificationsContext();
    const navigate = useNavigate()
    const location = useLocation();
    const { t } = useTranslation();

    const [notifications, setNotifications] = useState<NotificationI[]>([])
    const [hideSection, setHideSection] = useState(false)

    // TODO open chat buttons on profile view, invitation/notification view
    // TODO add to friends on chat/conversation view
    // TODO nav from notification to chat

    useEffect(() => {
        setNotifications(notificationsCtx.notifications)
    }, [notificationsCtx.notifications])

    useEffect(() => {
        const doHide = location.pathname.includes(Path.NOTIFICATIONS)
        if (doHide !== hideSection) {   
            setHideSection(doHide)
        }
    }, [location.pathname])

    const unreadCount = notifications?.filter(n => n.readAt == null).length
    const isVisible = !!unreadCount && !hideSection;

    const getMessage = () => {
        let key = unreadCount === 1
            ? 'notification.unreadNotificationsOne'
            : unreadCount > 1 && unreadCount < 5
                ? 'notification.unreadNotificationsFew'
                : 'notification.unreadNotificationsMany'
        return t(key, { count: unreadCount })   
    }

    return <AnimatePresence>
        {isVisible && (
            <motion.div
                key="notification-bar"
                initial={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 4, marginBottom: 4 }}
                exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                className="mx-2 overflow-hidden"
            >
                <div
                    className="px-3 py-2 rounded-md secondary-bg rippple notification-bar"
                    onClick={() => navigate(Path.NOTIFICATIONS)}
                >
                    <div className="flex items-center gap-3 primary-color">
                        <FaBell size={24}></FaBell>
                        <h2 className="">{getMessage()}</h2>
                    </div>
                </div>
            </motion.div>
        )}
    </AnimatePresence>
}

export default NotificationsGlobalBar;