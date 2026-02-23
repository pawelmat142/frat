import React, { useEffect, useState } from "react";
import Loading from "global/components/Loading";
import { UserI } from "@shared/interfaces/UserI";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "auth/AuthProvider";
import Button from "global/components/controls/Button";
import { AuthService } from "auth/services/AuthService";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import { UserPublicService } from "user/services/UserPublicService";
import AvatarTile from "user/components/AvatarTile";
import { Path } from "../../path";
import { BtnModes } from "global/interface/controls.interface";
import { useConfirm } from "global/providers/PopupProvider";
import { UserManagementService } from "user/services/UserManagementService";
import { FirebaseAuth } from "auth/services/FirebaseAuth";
import { ChatService } from "chat/services/ChatService";
import { WorkerI } from "@shared/interfaces/WorkerProfileI";
import { OfferI } from "@shared/interfaces/OfferI";
import { WorkerService } from "employee/services/WorkerService";
import { OffersService } from "offer/services/OffersService";
import { FriendshipI, FriendshipStatuses } from "@shared/interfaces/FriendshipI";
import { FriendsService } from "friends/services/FriendsService";
import { Icons } from "global/icon.def";

const ProfileView: React.FC = () => {

    // TODO optimize endpoints number for init worker profie, offers, friendships, etc

    const { me, loading, firebaseUser } = useAuthContext()
    const userCtx = useUserContext()
    const [user, setUser] = useState<UserI | null>(null)
    const { uid } = useParams<{ uid?: string }>()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const confirm = useConfirm()

    const [localLoading, setLocalLoading] = useState(true);
    const [worker, setWorker] = useState<WorkerI | null>(null)
    const [offers, setOffers] = useState<OfferI[]>([])

    const isMyAccount = uid === me?.uid

    useEffect(() => {
        setLocalLoading(true);
        const initUser = async () => {
            if (uid) {
                if (uid === me?.uid) {
                    setUser(me)
                } else {
                    const _user = await UserPublicService.fetchUser(uid)
                    setUser(_user)
                }
            }
        }

        initUser();
    }, [uid, me]);

    useEffect(() => {
        if (!user) {
            return
        }

        if (user.uid === me?.uid) {
            setOffers(userCtx.offers)
            setWorker(userCtx.worker)
            setLocalLoading(false);
        } else {
            initUserData(user);
        }
    }, [user]);


    const initUserData = async (user: UserI) => {
        const [userEmployeeProfile, userOffers] = await Promise.all([
            WorkerService.fetchWorkerByDisplayName(user.displayName),
            OffersService.listUsersOffers(user.uid)
        ])
        setWorker(userEmployeeProfile)
        setOffers(userOffers)
        setLocalLoading(false);
    }

    useEffect(() => {
        setLocalLoading(loading);
    }, [loading]);

    if (localLoading) {
        return <Loading />;
    }

    const sendVerificationEmail = async () => {
        try {
            await AuthService.sendVerificationEmail();
            toast.success(t('signup.verificationEmailSent'));
        } catch (error) { } finally {
        }
    }

    const sendInvite = async () => {
        try {
            setLocalLoading(true)
            const result = await FriendsService.sendInvite(user!.uid)
            toast.success(t('friends.invitationSent'))
            userCtx.putFriendship(result);
        }
        finally {
            setLocalLoading(false);
        }
    }

    // Show warning if email not verified
    const emailNotVerifiedWarning = isMyAccount && !firebaseUser?.emailVerified ? (
        <div className="mb-6 p-4 rounded border error-color text-center flex flex-col items-center">
            <div className="font-bold mb-2">{t('signup.emailVerificationRequired')}</div>
            <div className="mb-2">{t('signup.emailVerificationMessage')}</div>
            <Button
                className="mx-auto"
                onClick={sendVerificationEmail}
            >{t('signup.resendVerificationEmail')}</Button>
        </div>
    ) : null;

    if (!user) {
        return <div className="p-5 text-center secondary-text">{t('user.error.notFound')}</div>;
    }

    const getFriendship = (): FriendshipI | undefined => {
        return userCtx.friendships.find(f => [f.addresseeUid, f.requesterUid].includes(user?.uid));
    }

    const isFriend = getFriendship()?.status === FriendshipStatuses.ACCEPTED;

    const openWorkerProfileOrForm = () => {
        if (worker) {
            navigate(Path.getWorkerProfilePath(worker.displayName));
        } else {
            navigate(Path.WORKER_FORM);
        }
    };

    const deleteAccount = async () => {
        const confirmed = await confirm({
            title: t('account.deleteAccountConfirmTitle'),
            message: t('account.deleteAccountConfirmMessage'),
        });

        if (!confirmed) {
            return;
        }

        try {
            setLocalLoading(true);
            await UserManagementService.deleteAccount();
            FirebaseAuth.getAuth().signOut()
            toast.success(t('account.deleteAccountSuccessToast'));
        } catch (error) {
            console.error(error);
            toast.error(t('account.deleteAccountFailed'));
        } finally {
            setLocalLoading(false);
        }
    }

    const goToUserOffers = () => {
        navigate(Path.getOffersPath(user.uid));
    };

    const openChat = async () => {
        if (!user) return;
        try {
            const chat = await ChatService.getOrCreateDirectChat(user.uid);
            navigate(Path.getConversationPath(chat.chatId));
        } catch (error) {
            console.error('Failed to open chat:', error);
            toast.error(t('chat.error.cannotOpen'));
        }
    }

    const getFriendshipButton = () => {
        if (isMyAccount) {
            return null;
        }
        const friendship = getFriendship();

        if (!friendship || friendship.status === FriendshipStatuses.REJECTED) {
            return <Button
                fullWidth
                mode={BtnModes.SECONDARY}
                onClick={sendInvite}
            >
                <Icons.FRIENDS className="mr-2" />
                {t('friends.invite')}
            </Button>
        }

        const rejectInvitationBtn = friendship.status === FriendshipStatuses.PENDING ? (
            <Button
                fullWidth
                mode={BtnModes.ERROR_TXT}
                onClick={async () => { rejectInvitation(friendship); }}
            >
                <Icons.CANCEL className="mr-2" />
                {t('friends.reject')}
            </Button>
        ) : null

        if (friendship.status === FriendshipStatuses.ACCEPTED) {
            return <Button
                fullWidth
                mode={BtnModes.ERROR_TXT}
                onClick={() => removeFriend(friendship)}
            >
                <Icons.DELETE className="mr-2" />
                {t('friends.remove')}
            </Button>
        }
        if (friendship.status === FriendshipStatuses.PENDING) {
            if (friendship.addresseeUid === me?.uid) {
                return (<>
                    <Button
                        fullWidth
                        mode={BtnModes.SECONDARY}
                        onClick={async () => { acceptInvitation(friendship); }}
                    >
                        <Icons.FRIENDS className="mr-2" />
                        {t('friends.accept')}
                    </Button>
                    {rejectInvitationBtn}
                </>)
            }
            return (rejectInvitationBtn)
        }
    }

    const removeFriend = async (friendship: FriendshipI) => {
        const confirmed = await confirm({
            title: t('friends.remove'),
            message: t('friends.removeConfirm'),
        });
        if (!confirmed) return;

        try {
            setLocalLoading(true);
            await FriendsService.removeFriend(friendship.friendshipId);
            toast.success(t('friends.removeSuccess'));
        } catch (error) {
            console.error(error);
            toast.error(t('friends.removeFailed'));
        } finally {
            setLocalLoading(false);
        }
    }

    const acceptInvitation = async (friendship: FriendshipI) => {
        try {
            setLocalLoading(true);
            const result = await FriendsService.acceptInvite(friendship.friendshipId)
            toast.success(t('friends.acceptedToast'));
        }
        finally {
            setLocalLoading(false);
        }
    }

    const rejectInvitation = async (friendship: FriendshipI) => {
        try {
            setLocalLoading(true);
            const result = await FriendsService.rejectInvite(friendship.friendshipId)
            toast.success(t('friends.rejectedToast'));
        }
        finally {
            setLocalLoading(false);
        }
    }

    return (
        <div className="view-container">

            {emailNotVerifiedWarning}

            <div className="flex flex-col items-center gap-4 mb-6">
                <AvatarTile
                    editable={isMyAccount}
                    uid={user.uid}
                    src={user.avatarRef?.url}
                />

                <div className="text-center">
                    <h2 className="text-xl font-bold">{user.displayName}</h2>
                    <p className="secondary-text">{user.email}</p>
                </div>
            </div>

            <div className="flex flex-col gap-3 mt-6">

                {isMyAccount && <Button
                    fullWidth
                    mode={BtnModes.SECONDARY}
                    onClick={() => { navigate(Path.NOTIFICATIONS); }}
                >
                    <Icons.NOTIFICATION className="mr-2" />
                    {t('notification.header')}
                </Button>}

                {(isFriend || isMyAccount) && <Button
                    fullWidth
                    mode={BtnModes.SECONDARY}
                    onClick={() => { navigate(Path.getFriendsPath(user.uid)); }}
                >
                    <Icons.FRIENDS className="mr-2" />
                    {t('account.friends')}
                </Button>}

                {isMyAccount ? (
                    <>
                        <Button
                            fullWidth
                            mode={BtnModes.SECONDARY}
                            onClick={() => { navigate(Path.CHATS); }}
                        >
                            <Icons.CHAT className="mr-2" />
                            {t('chat.chats')}
                        </Button>

                        <Button
                            fullWidth
                            mode={BtnModes.SECONDARY}
                            onClick={goToUserOffers}
                        >
                            <Icons.OFFER className="mr-2" />
                            {t('account.offers')} ({offers?.length || 0})
                        </Button>

                        {!worker ? (
                            <Button
                                fullWidth
                                mode={BtnModes.SECONDARY}
                                onClick={openWorkerProfileOrForm}
                            >
                                <Icons.WORKER className="mr-2" />
                                {t('account.createEmployeeProfile')}
                            </Button>
                        ) : (
                            <Button
                                fullWidth
                                mode={BtnModes.SECONDARY}
                                onClick={openWorkerProfileOrForm}
                            >
                                <Icons.WORKER className="mr-2" />
                                {t('account.showEmployeeProfile')}
                            </Button>
                        )}
                        <Button
                            fullWidth
                            mode={BtnModes.ERROR_TXT}
                            onClick={deleteAccount}
                        >
                            <Icons.TRASH className="mr-2" />
                            {t('account.deleteAccountConfirmTitle')}
                        </Button>
                    </>
                ) : (
                    <>
                        {!!offers.length && (
                            <Button
                                fullWidth
                                mode={BtnModes.SECONDARY}
                                onClick={goToUserOffers}
                            >
                                <Icons.OFFER className="mr-2" />
                                {t('account.offers')} ({offers?.length || 0})
                            </Button>)}

                        <Button
                            fullWidth
                            mode={BtnModes.PRIMARY}
                            onClick={openChat}
                        >
                            <Icons.CHAT className="mr-2" />
                            {t('chat.openChat')}
                        </Button>

                    </>
                )}

                {getFriendshipButton()}

            </div>

        </div>
    );
};

export default ProfileView;
