import { NotificationI } from "@shared/interfaces/NotificationI";
import { Path } from "../../path";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListItem from "global/components/ListItem";
import { useTranslation } from "react-i18next";

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

    return (
        <div onClick={goToNotification}>
            <ListItem
                // imgUrl={profile.avatarRef?.url || AVATAR_MOCK}
                topLeft={t(notification.title)}
                bottomLeft={t(notification.message)}
                first={first}
                last={last}
            ></ListItem>
        </div>
    )

}

export default NotificationListItem;