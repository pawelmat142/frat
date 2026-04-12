import { NotificationI, NotificationTypes } from "@shared/interfaces/NotificationI";
import { Path } from "../../path";
import { useNavigate } from "react-router-dom";
import ListItem from "global/components/ListItem";
import { useTranslation } from "react-i18next";

import { NotificationFrontUtil } from "notification/NotificationFrontUtil";
import { FrontDateUtil } from "global/utils/FrontDateUtil";

interface Props {
    notification: NotificationI
    first?: boolean,
    last?: boolean,
}

const NotificationListItem: React.FC<Props> = ({ notification, first, last }) => {

    const navigate = useNavigate()
    const { t } = useTranslation();

    const goToNotification = () => {
        if (NotificationTypes.NEW_MESSAGE === notification.type) {
            const chatId = Number(notification.targetId)
            navigate(Path.getConversationPath(chatId))
            return
        }
        navigate(Path.getNotificationPath(notification.notificationId.toString()))
    }

    const getIcon = (): React.ReactNode => {
        const result = notification.avatarRef ? null : NotificationFrontUtil.getIcon(notification)
        return result;
    }

    const getDateMsg = () => {
        return <div className="xs-font">{notification.requesterName}</div>
    }

    const shortDate = (): React.ReactNode => {
        const date = notification.readAt ? notification.readAt : notification.createdAt;
        return <span className="xs-font">{FrontDateUtil.displayShortDateOrDayOrTimeIfToday(t, date)}</span>
    } 

    const getUnreadCount = (): React.ReactNode => {
        if (notification.metadata?.unreadCount) {
            return <div className="unread-badge">{notification.metadata.unreadCount}</div>;
        }
        return null;
    }

    const badge = notification.readAt ? null : <div className="notification-badge-red"></div>;

    return (
        <div onClick={goToNotification}>
            <ListItem
                imgUrl={notification.avatarRef?.url}
                imgComponent={getIcon()}
                iconOrAvatarBadge={badge}
                topLeft={t(notification.title)}
                bottomLeft={getDateMsg()}
                bottomRight={getUnreadCount()}
                topRight={shortDate()}
                first={first}
                last={last}
            ></ListItem>
        </div>
    )

}

export default NotificationListItem;