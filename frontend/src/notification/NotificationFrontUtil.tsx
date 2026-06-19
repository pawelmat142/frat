import { AppConfig } from "@shared/AppConfig";
import { NotificationI, NotificationIcons } from "@shared/interfaces/NotificationI";
import { Ico } from "global/icon.def";

export abstract class NotificationFrontUtil {
    public static getIcon = (notification: NotificationI, size?: number): React.ReactNode => {
        const iconSize = `${size || AppConfig.DEFAULT_ICON_SIZE}rem`;
        if (NotificationIcons.FRIEND === notification.icon) {
            return <Ico.FRIENDS size={iconSize} />
        }
        if (NotificationIcons.CHAT === notification.icon) {
            return <Ico.CHAT size={iconSize} />
        }
        return <Ico.NOTIFICATION size={iconSize} />;

    }
}