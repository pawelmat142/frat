import Loading from "global/components/Loading";
import ListUi from "global/components/ui/ListUi";
import { Ico } from "global/icon.def";
import NotificationsGlobalBar from "notification/components/NotificationsGlobalBar";
import { Path } from "../path";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { EDIT_AVATAR_FLAG_KEY } from "user/components/AvatarTile";
import { AuthService } from "auth/services/AuthService";
import { useConfirm } from "global/providers/PopupProvider";
import { BtnModes, MenuItem } from "global/interface/controls.interface";
import ReportForm from "global/components/ReportForm";
import UserProfileItem from "user/components/UserProfileItem";
import { useTranslation } from "react-i18next";
import EmailVerificationWarning from "./EmailVerificationWarning";
import { usePwaInstall } from "global/hooks/usePwaInstall";
import { Util } from "@shared/utils/util";
import { UserRoles } from "@shared/interfaces/UserI";
import { useGlobalContext } from "global/providers/GlobalProvider";
import RecentViewedWorkers from "./RecentViewedWorkers";
import RecentViewedOffers from "./RecentViewedOffers";
import { useWorkersSearch } from "employee/views/search/WorkersSearchProvider";
import { useOfferSearch } from "offer/views/search/OfferSearchProvider";
import MyListDashboard from "./MyListDashboard";
import IconButton from "global/components/controls/IconButon";
import { useDrawer } from "global/providers/DrawerProvider";
import MyOffersDashboard from "./MyOffersDashboard";
import LatestOffersDashboard from "./LatestOffersDashboard";
import MostViewedWorkers from "./MostViewedWorkers";
import FriendsDashboard from "./FriendsDashboard";
import Button from "global/components/controls/Button";

const DashboardView: React.FC = () => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const workerSearchCtx = useWorkersSearch();
    const offerSearchCtx = useOfferSearch();
    const drawer = useDrawer()
    const confirm = useConfirm()
    const { isInstallable, install } = usePwaInstall();
    const { isDesktop } = useGlobalContext();

    const me = userCtx.me;
    const editableAvatar = localStorage.getItem(EDIT_AVATAR_FLAG_KEY) === 'true';

    if (userCtx.loading || !me) {
        return <Loading></Loading>
    }

    const logout = async () => {
        const confirmed = await confirm({
            title: t("signin.logoutPopupTitle"),
            message: t("signin.logoutPopupMessage"),
            confirmText: t("signin.logoutPopupConfirm"),
        })
        if (confirmed) {
            AuthService.logout();
        }
    }

    const trainingProvider = userCtx.meCtx?.trainingProvider;
    const trainingAccess = Util.hasPermission([UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN], me)

    const menuActions: MenuItem[] = [{
        label: "Admin panel",
        icon: Ico.SETTINGS,
        if: isDesktop && Util.hasPermission([UserRoles.ADMIN, UserRoles.SUPERADMIN], me),
        onClick: () => navigate(Path.ADMIN_DICTIONARIES)
    }, {
        label: t("pwa.install"),
        if: isInstallable,
        icon: Ico.DOWNLOAD,
        onClick: install
    }, {
        label: t("notification.header"),
        icon: Ico.NOTIFICATION,
        onClick: () => navigate(Path.NOTIFICATIONS)
    }, {
        label: t("user.myList"),
        icon: Ico.STAR,
        onClick: () => navigate(Path.MY_LIST)
    }, {
        icon: Ico.CHAT,
        label: t("chat.chats"),
        onClick: () => navigate(Path.CHATS)
    }, {
        icon: Ico.FRIENDS,
        label: t("account.friends"),
        onClick: () => navigate(Path.getFriendsPath(me.uid))
    }, {
        label: t("employeeProfile.search"),
        icon: Ico.SEARCH,
        onClick: () => workerSearchCtx.navToSearch()
    }, {
        label: t("user.browseOffers"),
        icon: Ico.CATEGORIES,
        onClick: () => offerSearchCtx.navToSearch()
    }, {
        label: t("user.addOffer"),
        icon: Ico.OFFER,
        onClick: () => navigate(Path.OFFER_FORM)
    }, {
        if: userCtx.meCtx?.offers?.length,
        icon: Ico.OFFER,
        label: t("user.myOffers"),
        onClick: () => navigate(Path.getOffersPath(me.uid))
    }, {
        if: !!userCtx.meCtx?.workerProfile,
        icon: Ico.EDIT,
        label: t("user.myWorkerProfile"),
        onClick: () => navigate(Path.getWorkerProfilePath(userCtx.meCtx!.workerProfile!.displayName)),
    }, {
        if: !userCtx.meCtx?.workerProfile,
        icon: Ico.ADD_USER,
        label: t("user.addWorkerProfile"),
        onClick: () => navigate(Path.WORKER_FORM)
    }, {
        // TODO translations
        if: trainingAccess && !!trainingProvider,
        icon: Ico.TRAINING,
        label: t("training.myTrainings"),
        onClick: () => navigate(Path.MY_TRAININGS)
    }, {
        if: trainingAccess && !trainingProvider,
        icon: Ico.TRAINING,
        label: t("training.provider.create"),
        onClick: () => navigate(Path.TRAINING_PROVIDER_FORM)
    }, {
        label: t("common.settings"),
        icon: Ico.SETTINGS,
        onClick: () => navigate(Path.SETTINGS)
    }, {
        label: t("signin.logout"),
        icon: Ico.SIGN_OUT,
        onClick: logout
    }].map(item => {
        const originalOnClick = item.onClick;
        item.onClick = () => {
            drawer.close();
            originalOnClick?.();
        };
        return item;
    });

    const menu = <IconButton className="py-3 px-3" icon={<Ico.BURGER />} mode={BtnModes.SECONDARY_TXT} onClick={() => {
        drawer.open({
            showClose: true,
            title: t("common.menu"),
            children: <ListUi items={menuActions} itemClassName="m-font py-1"></ListUi>
        })
    }}></IconButton>;

    return (<div className="w-full">

        <NotificationsGlobalBar />

        <UserProfileItem
            user={me}
            topRightComponent={menu}
            editableAvatar={editableAvatar}
        ></UserProfileItem>

        <EmailVerificationWarning></EmailVerificationWarning>

        <div className="flex justify-end w-full">
            {userCtx.meCtx?.workerProfile ? (
                <Button
                    onClick={() => navigate(Path.getWorkerProfilePath(userCtx.meCtx!.workerProfile!.displayName))}
                    mode={BtnModes.PRIMARY_TXT}>
                    {t("user.myWorkerProfile")}
                    <Ico.CHEVRON_RIGHT />
                </Button>
            ) : (
                <Button
                    onClick={() => navigate(Path.WORKER_FORM)}
                    mode={BtnModes.PRIMARY_TXT}>
                    {t("user.addWorkerProfile")}
                    <Ico.CHEVRON_RIGHT />
                </Button>
            )}
        </div>

        <MyListDashboard></MyListDashboard>

        <FriendsDashboard></FriendsDashboard>

        <MyOffersDashboard></MyOffersDashboard>

        <LatestOffersDashboard></LatestOffersDashboard>

        <MostViewedWorkers></MostViewedWorkers>

        <RecentViewedOffers></RecentViewedOffers>

        <RecentViewedWorkers></RecentViewedWorkers>

        <div className="view-margin">
            <ReportForm />
        </div>

    </div>)
}

export default DashboardView;