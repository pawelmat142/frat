import NotificationListItem from "notification/components/NotificationListItem";
import { useNotificationsContext } from "notification/NotificationsProvider";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaBell } from "react-icons/fa";

const NotificationsView: React.FC = () => {

    const notificationsCtx = useNotificationsContext();
    const { t } = useTranslation();

    // Sort notifications: unread first, then by createdAt descending
    const notifications = (notificationsCtx.notifications ?? []).slice().sort((a, b) => {
        // Unread first
        const aUnread = a.readAt == null;
        const bUnread = b.readAt == null;
        if (aUnread !== bUnread) {
            return aUnread ? -1 : 1;
        }
        // Newest first
        const aTime = new Date(a.createdAt).getTime();
        const bTime = new Date(b.createdAt).getTime();
        return bTime - aTime;
    });

    useEffect(() => { }, [notificationsCtx.notifications])

    return <div className="list-view">

        {!notifications.length && (
            <div className="flex flex-col items-center gap-3 mt-10 px-5 text-center">
                <FaBell size={48} className="secondary-text" />
                <div className="secondary-text">{t('notification.noNotifications')}</div>
            </div>
        )}

        {(notifications ?? []).map((notification, index) => (
            <NotificationListItem
                key={index}
                notification={notification}
                first={index === 0}
                last={index === (notifications?.length ?? 0) - 1}
            ></NotificationListItem>
        ))}
        {/* <InfiniteScrollEventEmitter emitEvent={ctx.loadMore} /> */}

    </div>

}

export default NotificationsView;