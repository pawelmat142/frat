import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NotificationListPanel from "./NotificationListPanel";
import SingleNotificationView from "./SingleNotificationView";

const DesktopNotificationEmptyState: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="desktop-notification-empty-state">
            {t("notification.selectNotification", "Select a notification to view its details")}
        </div>
    );
};

const DesktopNotificationsWrapper: React.FC = () => {
    const { notificationId } = useParams<{ notificationId: string }>();

    return (
        <div className="desktop-notification-layout">
            <aside className="desktop-notification-list">
                <NotificationListPanel selectedNotificationId={notificationId} showTitle />
            </aside>
            <main className="desktop-notification-detail">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={notificationId || "empty"}
                        className="desktop-notification-detail-content"
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                        {notificationId ? <SingleNotificationView showHeader={false} /> : <DesktopNotificationEmptyState />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default DesktopNotificationsWrapper;