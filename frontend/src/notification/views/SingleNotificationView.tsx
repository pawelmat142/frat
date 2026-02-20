import { NotificationI, NotificationTypes } from "@shared/interfaces/NotificationI";
import { FriendsService } from "friends/services/FriendsService";
import Button from "global/components/controls/Button";
import Loading from "global/components/Loading";
import HeaderBackBtn from "global/header-state/HeaderBackBtn";
import { BtnModes } from "global/interface/controls.interface";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { NotificationFrontUtil } from "notification/NotificationFrontUtil";
import { NotificationService } from "notification/services/NotificationService";
import { Path } from "../../path";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { useAuthContext } from "auth/AuthProvider";

const SingleNotificationView: React.FC = () => {

    const globalCtx = useGlobalContext();
    const userCtx = useUserContext();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { me } = useAuthContext();

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

    // TODO remove
    console.log('notification:', notification)

    const getActions = (): React.ReactNode => {
        if (NotificationTypes.FRIEND_INVITE === notification?.type) {
            const friendshipId = Number(notification.targetId)

            return <div className="flex flex-col gap-3">

                <Button fullWidth mode={BtnModes.PRIMARY} onClick={async () => {
                    try {
                        setLoading(true)
                        await FriendsService.acceptInvite(friendshipId)
                        navigate(Path.getFriendsPath(me!.uid))
                    } finally {
                        setLoading(false)
                    }
                }}>{t('friends.accept')}</Button>

                <Button fullWidth mode={BtnModes.ERROR_TXT} onClick={async () => {
                    try {
                        setLoading(true)
                        await FriendsService.rejectInvite(friendshipId)
                        navigate(-1)
                    } finally {
                        setLoading(false)
                    }
                }}>{t('friends.reject')}</Button>
            </div>


        }
        return null
    }

    if (loading || !notification) {
        return <Loading></Loading>
    }

    return <div className="view-container">

        <div className="flex flex-col justify-center  gap-4 mb-6">

            <div className="notification-icon flex justify-center mt-5 mb-5">
                {NotificationFrontUtil.getIcon(notification)}
            </div>

            <div className="text-center">
                <h2 className="text-xl font-bold">{t(notification.title)}</h2>
                <p className="secondary-text mt-10 mb-5 mx-10">{t(notification.message, notification.messageParams)}</p>
            </div>

            {getActions()}
        </div>

    </div>
}

export default SingleNotificationView;