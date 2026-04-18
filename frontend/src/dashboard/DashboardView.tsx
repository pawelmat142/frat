import Loading from "global/components/Loading";
import ListUi from "global/components/ui/ListUi";
import { Ico } from "global/icon.def";
import NotificationsGlobalBar from "notification/components/NotificationsGlobalBar";
import { Path } from "../path";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { AuthService } from "auth/services/AuthService";
import { useConfirm } from "global/providers/PopupProvider";
import { MenuItem } from "global/interface/controls.interface";
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

const DashboardView: React.FC = () => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const workerSearchCtx = useWorkersSearch();
    const offerSearchCtx = useOfferSearch();
    const confirm = useConfirm()
    const { isInstallable, install } = usePwaInstall();
    const { isDesktop } = useGlobalContext();
    
    const me = userCtx.me;
    const myListedItems = userCtx.meCtx?.listedItems;

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

    const quickActions: MenuItem[] = [{
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
        label: t("user.findTechnician"),
        icon: Ico.SEARCH,
        onClick: () => {
            workerSearchCtx.navToSearch()
        }
    }, {
        label: t("user.browseOffers"),
        icon: Ico.CATEGORIES,
        onClick: () => {
            offerSearchCtx.navToSearch()
        }
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
        label: t("user.addOffer"),
        icon: Ico.OFFER,
        onClick: () => navigate(Path.OFFER_FORM)
    }, {
        if: userCtx.meCtx?.offers?.length,
        icon: Ico.OFFER,
        label: t("user.myOffers"),
        onClick: () => navigate(Path.getOffersPath(me.uid))
    }, {
        icon: Ico.CHAT,
        label: t("chat.chats"),
        onClick: () => navigate(Path.CHATS)
    }, {
        icon: Ico.FRIENDS,
        label: t("account.friends"),
        onClick: () => navigate(Path.getFriendsPath(me.uid))
    }, {
        label: t("notification.header"),
        icon: Ico.NOTIFICATION,
        onClick: () => navigate(Path.NOTIFICATIONS)
    }, {
        label: t("common.settings"),
        icon: Ico.SETTINGS,
        onClick: () => navigate(Path.SETTINGS)
    }, {
        label: t("signin.logout"),
        icon: Ico.SIGN_OUT,
        onClick: logout
    }]

    return (<div className="w-full">

        <NotificationsGlobalBar />

        <UserProfileItem user={me}></UserProfileItem>

        <EmailVerificationWarning></EmailVerificationWarning>

        <ListUi items={quickActions} itemClassName="m-font py-3"></ListUi>

        <MyListDashboard></MyListDashboard>

        <RecentViewedWorkers></RecentViewedWorkers>

        <RecentViewedOffers></RecentViewedOffers>

        <div className="px-5">
            <ReportForm />
        </div>

    </div>)
}

export default DashboardView;