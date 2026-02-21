import { NotificationI } from "@shared/interfaces/NotificationI";
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
        navigate(Path.getNotificationPath(notification.notificationId))
    }

    const getIcon = (): React.ReactNode => {
        if (notification.avatarRef) {
            return null
        }
        return NotificationFrontUtil.getIcon(notification)
    }

    const getMessage = () => {
        const lettersLimit = 35
        let msg = t(notification.message, notification.messageParams)
        if (msg.length > lettersLimit) {
            msg = msg.slice(0, lettersLimit) + '...'
        }
        return <div className="small-font">{msg}</div>
    }

    const getDateMsg = () => {
        const msg = notification.readAt
            ? t('notification.readAt', { date: FrontDateUtil.displayDateWithTime(t, notification.readAt) })
            : t('notification.sentAt', { date: FrontDateUtil.displayDateWithTime(t, notification.createdAt) })      

        return <div className="small-font">{msg}</div>
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
                first={first}
                last={last}
            ></ListItem>
        </div>
    )

}

export default NotificationListItem;