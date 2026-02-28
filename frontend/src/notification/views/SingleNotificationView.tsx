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
import AvatarTile from "user/components/AvatarTile";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";
import { NotificationFrontUtil } from "notification/NotificationFrontUtil";
import { FrontDateUtil } from "global/utils/FrontDateUtil";
import { useNotificationsContext } from "notification/NotificationsProvider";
import { Ico } from "global/icon.def";
import { ChatService } from "chat/services/ChatService";
import { useUserContext } from "user/UserProvider";

const SingleNotificationView: React.FC = () => {

    const globalCtx = useGlobalContext();
    const notificationsCtx = useNotificationsContext();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { me } = useUserContext();
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
        markNotificationAsRead()
    }, [notification])

    const initNotification = () => {
        if (!notificationId || notification) {
            return;
        }
        const found = notificationsCtx.notifications.find(n => String(n.notificationId) === notificationId)
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

    const markNotificationAsRead = async () => {
        if (!notification || notification.readAt) {
            return
        }
        try {
            await NotificationService.markAsRead(notification)
            notification.readAt = new Date()
            notificationsCtx.notificationReceived(notification)
        } catch (error) {
        }

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
            notificationsCtx.notificationDeleted(notification!.notificationId)
            navigate(-1)
        }
        finally {
            setLoading(false)
        }
    }

    const goToRequesterProfile = () => {
        if (!notification?.requesterUid) {
            return
        }
        navigate(Path.getProfilePath(notification.requesterUid))
    }

    const openChat = async () => {
        if (!notification?.requesterUid) {
            return
        }
        try {
            const chat = await ChatService.getOrCreateDirectChat(notification.requesterUid)
            navigate(Path.getConversationPath(chat.chatId))
        } catch (error) {
            console.error('Failed to open chat:', error)
            toast.error(t('chat.error.cannotOpen'))
        }
    }

    const getActions = (): React.ReactNode => {

        const deleteButton = <Button fullWidth mode={BtnModes.ERROR_TXT} onClick={deleteNotification}
        ><Ico.DELETE className="mr-2" />{t('notification.deleteNotification')}</Button>

        const requesterProfileButton = !!notification?.requesterUid && <Button fullWidth mode={BtnModes.SECONDARY}
            onClick={goToRequesterProfile}>{t('notification.viewProfile', { name: notification.requesterName })}</Button>

        const openChatButon = !!notification?.requesterUid && <Button fullWidth mode={BtnModes.PRIMARY}
            onClick={openChat}><Ico.CHAT></Ico.CHAT>{t('chat.openChat')}</Button>

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

                {openChatButon}
                {requesterProfileButton}

                <Button fullWidth mode={BtnModes.ERROR_TXT} onClick={async () => {
                    try {
                        setLoading(true)
                        await FriendsService.rejectInvite(friendshipId)
                        navigate(-1)
                    } finally {
                        setLoading(false)
                    }
                }}><Ico.CANCEL className="mr-2" />{t('friends.reject')}</Button>

                {deleteButton}

            </div>
        }
        return <>
            {openChatButon}
            {requesterProfileButton}
            {deleteButton}
        </>
    }

    if (loading || !notification) {
        return <Loading></Loading>
    }

    return (<div className="view-container">

        <div className="flex flex-col justify-center gap-4 mb-6">

            {notification.avatarRef ? (<div className="notification-avatar-wrapper" onClick={goToRequesterProfile}>
                <AvatarTile
                    src={notification.avatarRef?.url}
                    editable={false}
                    uid={""}
                />
            </div>) : (
                <div className="notification-view-icon mt-5">{NotificationFrontUtil.getIcon(notification)}</div>
            )}

            <div className="text-center mx-10">
                <h2 className="text-xl font-bold mt-5">{t(notification.title)}</h2>
                <p className="secondary-text mt-5 mb-5 ">{t(notification.message, notification.messageParams)}</p>
            </div>

            <div>
                <p className="small-font secondary-text mt-5 mb-1">
                    {t('notification.sentAt', { date: FrontDateUtil.displayDateWithTime(t, notification.createdAt) })}</p>
                {!!notification.readAt && (<p className="small-font secondary-text mb-5">
                    {t('notification.readAt', { date: FrontDateUtil.displayDateWithTime(t, notification.readAt) })}</p>)}
            </div>

            <div className="flex flex-col gap-3 mt-6">
                {getActions()}
            </div>
        </div>

    </div>)
}

export default SingleNotificationView;