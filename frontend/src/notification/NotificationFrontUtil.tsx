import { NotificationI, NotificationIcons } from "@shared/interfaces/NotificationI";
import { FaBell, FaComments, FaUserFriends } from "react-icons/fa";

// todo wydzielic plik ze zbiorem ikon zeby latwiej bylo utrzymac
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