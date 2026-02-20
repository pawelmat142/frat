import { NotificationI, NotificationIcons } from "@shared/interfaces/NotificationI";
import { FaBell, FaComments, FaUserFriends } from "react-icons/fa";

export abstract class NotificationFrontUtil {
    public static getIcon = (notification: NotificationI): React.ReactNode => {
        if (NotificationIcons.FRIEND === notification.icon) {
            return <FaUserFriends />
        }
        if (NotificationIcons.CHAT === notification.icon) {
            return <FaComments />
        }
        return <FaBell />;

    }
}