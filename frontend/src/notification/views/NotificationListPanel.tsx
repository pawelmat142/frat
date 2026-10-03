import { AppConfig } from "@shared/AppConfig";
import { Ico } from "global/icon.def";
import NotificationListItem from "notification/components/NotificationListItem";
import { useNotificationsContext } from "notification/NotificationsProvider";
import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
    selectedNotificationId?: string;
    showTitle?: boolean;
}

const NotificationListPanel: React.FC<Props> = ({ selectedNotificationId, showTitle = false }) => {
    const { notifications: receivedNotifications } = useNotificationsContext();
    const { t } = useTranslation();
    const iconSize = `${AppConfig.AVATAR.SIZE.DEFAULT}rem`;

    const notifications = receivedNotifications.slice().sort((a, b) => {
        const aUnread = a.readAt == null;
        const bUnread = b.readAt == null;
        if (aUnread !== bUnread) return aUnread ? -1 : 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return (
        <div className="list-view notification-list-panel">
            {showTitle && (
                <div className="desktop-notification-list-header">
                    <h1 className="desktop-notification-list-title">{t("notification.header")}</h1>
                </div>
            )}

            {!notifications.length && (
                <div className="flex flex-col items-center gap-3 mt-10 px-5 text-center">
                    <Ico.NOTIFICATION size={iconSize} className="secondary-text" />
                    <div className="secondary-text">{t("notification.noNotifications")}</div>
                </div>
            )}

            {notifications.map((notification, index) => {
                const isSelected = String(notification.notificationId) === selectedNotificationId;

                return (
                    <NotificationListItem
                        key={notification.notificationId}
                        notification={notification}
                        first={index === 0}
                        last={index === notifications.length - 1}
                        className={`notification-list-panel-item${isSelected ? " worker-search-list-item-selected" : ""}`}
                    />
                );
            })}
        </div>
    );
};

export default NotificationListPanel;