import React, { useEffect, useId, useState } from "react";
import Loading from "global/components/Loading";
import { UserI } from "@shared/interfaces/UserI";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthContext } from "auth/AuthProvider";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import { Path } from "../../path";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { OfferI } from "@shared/interfaces/OfferI";
import { WorkerService } from "employee/services/WorkerService";
import { OffersService } from "offer/services/OffersService";
import { Ico } from "global/icon.def";
import UserProfileItem from "user/components/UserProfileItem";
import ListUi from "global/components/ui/ListUi";
import FloatingActionButton from "global/components/buttons/FloatingActionButton";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { AppConfig } from "@shared/AppConfig";
import { MenuItem } from "global/interface/controls.interface";
import { useUsersStorage } from "global/providers/UsersStorageProvider";
import Header from "global/components/Header";
import { useFriendshipActions } from "friends/useFriendshipActions";
import { buildFriendshipMenuItems } from "friends/friendshipMenuBuilder";
import { FriendshipStatuses } from "@shared/interfaces/FriendshipI";

const ProfileView: React.FC = () => {

    const { loading: authLoading } = useAuthContext()
    const userCtx = useUserContext()
    const me = userCtx.me;
    const [user, setUser] = useState<UserI | null>(null)
    const { uid } = useParams<{ uid?: string }>()
    const { t } = useTranslation()
    const navigate = useNavigate()
    const userStorage = useUsersStorage();
    const globalCtx = useGlobalContext();
    const fabId = useId();

    const [loading, setLoading] = useState(true);
    const [worker, setWorker] = useState<WorkerI | null>(null)
    const [offers, setOffers] = useState<OfferI[]>([])

    const isMyAccount = uid === me?.uid

    const {
        getFriendship,
        sendInvite,
        removeFriend,
        acceptInvitation,
        rejectInvitation,
        openChat,
        loading: friendshipActionLoading,
    } = useFriendshipActions({
        targetUid: user?.uid || '',
    });

    useEffect(() => {
        setLoading(true);
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
            setLoading(false);
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
        setLoading(false);
    }

    useEffect(() => {
        setLoading(authLoading);
    }, [authLoading]);

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
    }, [user, isMyAccount]);

    if (loading || friendshipActionLoading) {
        return <Loading />;
    }

    if (!user) {
        return <div className="p-5 text-center secondary-text">{t('user.error.notFound')}</div>;
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

    const friendship = isMyAccount ? null : getFriendship();

    const baseMenuItems: MenuItem[] = [{
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
    }];

    const friendshipItems = buildFriendshipMenuItems({
        t,
        isMyAccount,
        friendship,
        me,
        onSendInvite: sendInvite,
        onRemoveFriend: removeFriend,
        onAcceptInvitation: acceptInvitation,
        onRejectInvitation: rejectInvitation,
        onOpenChat: openChat,
    });
    
    const menuItems = [
        ...friendshipItems,
        ...baseMenuItems
    ];

    return (
        <>
            <Header title={t('account.account')}></Header>
            
            <div className="w-full">

                <UserProfileItem user={user} className="px-2"></UserProfileItem>

                <div className="py-3">
                    <ListUi items={menuItems} itemClassName="m-font py-1"></ListUi>
                </div>


            </div>
        </>
    );
};

export default ProfileView;
