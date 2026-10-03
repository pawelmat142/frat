import Header from "global/components/Header";
import { useTranslation } from "react-i18next";
import NotificationListPanel from "./NotificationListPanel";

const NotificationsView: React.FC = () => {

    const { t } = useTranslation();

    return <>
        <Header title={t('notification.header')}></Header>
        <NotificationListPanel />
    </>
}

export default NotificationsView;