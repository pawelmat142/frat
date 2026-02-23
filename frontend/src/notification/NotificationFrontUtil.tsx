import { NotificationI, NotificationIcons } from "@shared/interfaces/NotificationI";
import { Icons } from "global/icon.def";

export abstract class NotificationFrontUtil {
    public static getIcon = (notification: NotificationI): React.ReactNode => {
        if (NotificationIcons.FRIEND === notification.icon) {
            return <Icons.FRIENDS />
        }
        if (NotificationIcons.CHAT === notification.icon) {
            return <Icons.CHAT />
        }
        return <Icons.NOTIFICATION />;

    }
}