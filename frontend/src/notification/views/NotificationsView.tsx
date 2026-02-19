import NotificationListItem from "notification/components/NotificationListItem";
import { useEffect } from "react";
import { useUserContext } from "user/UserProvider";

const NotificationsView: React.FC = () => {

    const userContext = useUserContext();

    const notifications = userContext.notifications;

    useEffect(() => {}, [notifications])  

    return <div className="w-full">
        <div className="results flex flex-col gap-1">
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