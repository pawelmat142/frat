import NotificationListItem from "notification/components/NotificationListItem";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaBell } from "react-icons/fa";
import { useUserContext } from "user/UserProvider";

const NotificationsView: React.FC = () => {

    const userContext = useUserContext();
    const { t } = useTranslation();

    // Sort notifications: unread first, then by createdAt descending
    const notifications = (userContext.notifications ?? []).slice().sort((a, b) => {
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

    useEffect(() => { }, [notifications])

    return <div className="list-view">

        <div className="px-2 flex flex-col mt-2">

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

    </div>
}

export default NotificationsView;