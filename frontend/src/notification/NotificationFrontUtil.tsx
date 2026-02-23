import { NotificationI, NotificationIcons } from "@shared/interfaces/NotificationI";
import { Ico } from "global/icon.def";

export abstract class NotificationFrontUtil {
    public static getIcon = (notification: NotificationI): React.ReactNode => {
        if (NotificationIcons.FRIEND === notification.icon) {
            return <Ico.FRIENDS />
        }
        if (NotificationIcons.CHAT === notification.icon) {
            return <Ico.CHAT />
        }
        return <Ico.NOTIFICATION />;

    }
}