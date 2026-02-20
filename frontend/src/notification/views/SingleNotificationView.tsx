import { NotificationI } from "@shared/interfaces/NotificationI";
import Loading from "global/components/Loading";
import HeaderBackBtn from "global/header-state/HeaderBackBtn";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { NotificationService } from "notification/services/NotificationService";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useUserContext } from "user/UserProvider";

const SingleNotificationView: React.FC = () => {

    const globalCtx = useGlobalContext();
    const userCtx = useUserContext();
    const { t } = useTranslation();

    const { notificationId } = useParams<{ notificationId: string }>();
    const [notification, setNotification] = useState<NotificationI | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        initNotification()
    }, [notificationId])

    useEffect(() => {
        if (!notification) {
            return
        }
        setViewState()
    }, [notification])

    const initNotification = () => {
        if (!notificationId || notification) {
            return;
        }
        const found = userCtx.notifications.find(n => String(n.notificationId) === notificationId)
        if (found) {
            setNotification(found)
        } else {
            fetchNotification()
        }
    }

    const fetchNotification = async () => {
        try {
            setLoading(true)
            const notification = await NotificationService.getNotification(notificationId!)
            setNotification(notification)
        } catch (error) {
            setNotification(null)
        }
        finally {
            setLoading(false)
        }
    }

    const setViewState = () => {
        globalCtx.setViewState({
            leftBtn: <div className="flex gap-2 items-center">
                <HeaderBackBtn />
                <div>{t(notification?.title)}</div>
            </div>
        })
    }

    if (loading) {
        return <Loading></Loading>
    }

    return <div></div>
}

export default SingleNotificationView;