import React, { useEffect, useId, useState } from "react";
import Loading from "global/components/Loading";
import { UserI } from "@shared/interfaces/UserI";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "auth/AuthProvider";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import { Path } from "../../path";
import { useConfirm } from "global/providers/PopupProvider";
import { ChatService } from "chat/services/ChatService";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { OfferI } from "@shared/interfaces/OfferI";
import { WorkerService } from "employee/services/WorkerService";
import { OffersService } from "offer/services/OffersService";
import { FriendshipI, FriendshipStatuses } from "@shared/interfaces/FriendshipI";
import { FriendsService } from "friends/services/FriendsService";
import { Ico } from "global/icon.def";
import { useFriendsContext } from "friends/FriendsProvider";
import UserProfileItem from "user/components/UserProfileItem";
import ListUi from "global/components/ui/ListUi";
import FloatingActionButton from "global/components/buttons/FloatingActionButton";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { AppConfig } from "@shared/AppConfig";
import { MenuItem } from "global/interface/controls.interface";
import { useUsersStorage } from "global/providers/UsersStorageProvider";
import Header from "global/components/Header";

const ProfileView: React.FC = () => {

    const { loading } = useAuthContext()
    const userCtx = useUserContext()
    const friendsCtx = useFriendsContext();
    const me = userCtx.me;
    const [user, setUser] = useState<UserI | null>(null)
    const { uid } = useParams<{ uid?: string }>()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const confirm = useConfirm()
    const userStorage = useUsersStorage();
    const globalCtx = useGlobalContext();
    const fabId = useId();

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
                    const _user = await userStorage.getUser(uid);
                    setUser(_user)
                }
            }
        }

        initUser();
    }, [uid, userCtx.me]);

    useEffect(() => {
        if (!user) {
            return
        }

        if (user.uid === me?.uid) {
            setOffers(userCtx.meCtx?.offers || []);
            setWorker(userCtx.meCtx?.workerProfile || null)
            setLocalLoading(false);
        } else {
            initUserData(user);
        }
    }, [user]);


    const initUserData = async (user: UserI) => {
        const [worker, userOffers] = await Promise.all([
            WorkerService.fetchWorkerByDisplayName(user.displayName),
            OffersService.listUsersOffers(user.uid)
        ])
        setWorker(worker)
        setOffers(userOffers)
        setLocalLoading(false);
    }

    useEffect(() => {
        setLocalLoading(loading);
    }, [loading]);

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

    useEffect(() => {
        if (!isMyAccount) {
            globalCtx.setFloatingButton(
                <FloatingActionButton
                    onClick={openChat}
                    icon={<Ico.MSG size={AppConfig.FAB_BTN_ICON_SIZE} />}
                />,
                fabId
            );
        }
        globalCtx.setHideFloatingButton(!isMyAccount);
    }, [user, isMyAccount]);

    useEffect(() => {
        return () => globalCtx.setFloatingButton(null);
    }, []);

    if (localLoading) {
        return <Loading />;
    }

    const sendInvite = async () => {
        try {
            setLocalLoading(true)
            const result = await FriendsService.sendInvite(user!.uid)
            toast.success(t('friends.invitationSent'))
            friendsCtx.putFriendship(result);
        }
        finally {
            setLocalLoading(false);
        }
    }

    if (!user) {
        return <div className="p-5 text-center secondary-text">{t('user.error.notFound')}</div>;
    }

    const getFriendship = (): FriendshipI | undefined => {
        return friendsCtx.friendships.find(f => [f.addresseeUid, f.requesterUid].includes(user?.uid));
    }

    const isFriend = getFriendship()?.status === FriendshipStatuses.ACCEPTED;

    const openWorkerProfileOrForm = () => {
        if (worker) {
            navigate(Path.getWorkerProfilePath(worker.displayName));
        } else {
            navigate(Path.WORKER_FORM);
        }
    };

    const goToUserOffers = () => {
        navigate(Path.getOffersPath(user.uid));
    };



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

    const friendship = isMyAccount ? null : getFriendship();

    const menuItems: MenuItem[] = [{
        label: t('chat.openChat'),
        if: !isMyAccount,
        icon: Ico.CHAT,
        onClick: openChat
    }, {
        label: t('account.friends'),
        if: isFriend || isMyAccount,
        icon: Ico.FRIENDS,
        onClick: () => { navigate(Path.getFriendsPath(user.uid)); }
    }, {
        label: t('account.showEmployeeProfile'),
        if: worker,
        icon: Ico.WORKER,
        onClick: openWorkerProfileOrForm
    }, {
        label: `${t('account.offers')} (${offers?.length || 0})`,
        if: offers.length,
        icon: Ico.OFFER,
        onClick: goToUserOffers
    }, {
        label: t('friends.invite'),
        if: !isMyAccount && (!friendship || friendship.status === FriendshipStatuses.REJECTED),
        icon: Ico.FRIENDS,
        onClick: sendInvite
    }, {
        label: t('friends.reject'),
        if: friendship?.status === FriendshipStatuses.PENDING,
        onClick: async () => { rejectInvitation(friendship!); },
        icon: Ico.CANCEL
    }, {
        label: t('friends.accept'),
        if: friendship?.status === FriendshipStatuses.PENDING && friendship.addresseeUid === me?.uid,
        onClick: async () => { acceptInvitation(friendship!); },
        icon: Ico.FRIENDS
    }, {
        label: t('friends.remove'),
        if: friendship?.status === FriendshipStatuses.ACCEPTED,
        onClick: () => removeFriend(friendship!),
        icon: Ico.DELETE
    }]


    return (
        <>
            <Header title={t('account.profile')}></Header>
            
            <div className="w-full">

                <UserProfileItem user={user}></UserProfileItem>

                <ListUi items={menuItems} itemClassName="m-font py-3"></ListUi>

            </div>
        </>
    );
};

export default ProfileView;
