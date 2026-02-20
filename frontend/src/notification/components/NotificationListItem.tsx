import { NotificationI, NotificationIcons, NotificationTypes } from "@shared/interfaces/NotificationI";
import { Path } from "../../path";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListItem from "global/components/ListItem";
import { useTranslation } from "react-i18next";
import { FaBell, FaUserFriends } from "react-icons/fa";

import { FaComments } from "react-icons/fa";

interface Props {
    notification: NotificationI
    first?: boolean,
    last?: boolean,
}

const NotificationListItem: React.FC<Props> = ({ notification, first, last }) => {

    const navigate = useNavigate()
    const { t } = useTranslation();

    const [loading, setLoading] = useState(false)

    const goToNotification = () => {
        navigate(Path.getNotificationPath(notification.notificationId))
    }

    const getIcon = (): React.ReactNode => {
        if (NotificationIcons.FRIEND === notification.icon) {
            return <FaUserFriends />
        }
        if (NotificationIcons.CHAT === notification.icon) {
            return <FaComments />
        }
        return <FaBell />;
    }

    return (
        <div onClick={goToNotification}>
            <ListItem
                imgUrl={notification.avatarRef?.url}
                topLeft={t(notification.title)}
                bottomLeft={t(notification.message, notification.messageParams)}
                first={first}
                last={last}
            ></ListItem>
        </div>
    )

}

export default NotificationListItem;