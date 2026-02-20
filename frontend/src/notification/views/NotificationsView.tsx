import NotificationListItem from "notification/components/NotificationListItem";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaBell } from "react-icons/fa";
import { useUserContext } from "user/UserProvider";

const NotificationsView: React.FC = () => {

    const userContext = useUserContext();
    const { t } = useTranslation();

    const notifications = userContext.notifications;

    useEffect(() => { }, [notifications])

    return <div className="list-view">

        <div className="px-2 flex flex-col gap-1 mt-2">

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