import React from "react";
import { useParams } from "react-router-dom";
import { useGlobalContext } from "global/providers/GlobalProvider";
import DesktopNotificationsWrapper from "./DesktopNotificationsWrapper";
import NotificationsView from "./NotificationsView";
import SingleNotificationView from "./SingleNotificationView";

const NotificationRouteView: React.FC = () => {
    const { isDesktop } = useGlobalContext();
    const { notificationId } = useParams<{ notificationId: string }>();

    if (isDesktop) return <DesktopNotificationsWrapper />;
    return notificationId ? <SingleNotificationView /> : <NotificationsView />;
};

export default NotificationRouteView;