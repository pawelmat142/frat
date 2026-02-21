import { NotificationI, NotificationTypes } from "@shared/interfaces/NotificationI";
import { FriendsService } from "friends/services/FriendsService";
import Button from "global/components/controls/Button";
import Loading from "global/components/Loading";
import HeaderBackBtn from "global/header-state/HeaderBackBtn";
import { BtnModes } from "global/interface/controls.interface";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { NotificationService } from "notification/services/NotificationService";
import { Path } from "../../path";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { useAuthContext } from "auth/AuthProvider";
import AvatarTile from "user/components/AvatarTile";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";

const SingleNotificationView: React.FC = () => {

    const globalCtx = useGlobalContext();
    const userCtx = useUserContext();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { me } = useAuthContext();
    const confirm = useConfirm()

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

    const deleteNotification = async () => {
        const confirmed = await confirm({
            title: t('notification.deleteNotification'),
            message: t('notification.deleteConfirmMessage'),
        })
        if (!confirmed) {
            return
        }
        try {
            setLoading(true)
            await NotificationService.deleteNotification(notification!.notificationId)
            toast.info(t('notification.deleteSuccessToast'))
            userCtx.notificationDeleted(notification!.notificationId)
            navigate(-1)
        }
        finally {
            setLoading(false)
        }
    }

    const getActions = (): React.ReactNode => {

        const deleteButton = <Button fullWidth mode={BtnModes.ERROR_TXT} onClick={deleteNotification}
        >{t('notification.deleteNotification')}</Button>

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

                {deleteButton}

            </div>
        }
        return <>{deleteButton}</>
    }

    if (loading || !notification) {
        return <Loading></Loading>
    }

    return (<div className="view-container">

        <div className="flex flex-col justify-center  gap-4 mb-6">

                <div className="notification-avatar-wrapper mt-5">
                    <AvatarTile
                        src={notification.avatarRef?.url}
                        editable={false}
                        uid={""}
                    />
                </div>

            <div className="text-center">
                <h2 className="text-xl font-bold mt-10">{t(notification.title)}</h2>
                <p className="secondary-text mt-5 mb-5 mx-10">{t(notification.message, notification.messageParams)}</p>
            </div>

            <div className="flex flex-col gap-3 mt-6">
                {getActions()}
            </div>
        </div>

    </div>)
}

export default SingleNotificationView;