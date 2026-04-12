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

const DashboardView: React.FC = () => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const confirm = useConfirm()
    const { isInstallable, install } = usePwaInstall();
    const { isDesktop } = useGlobalContext();
    
    const me = userCtx.me;
    const myListedItems = userCtx.meCtx?.listedItems;

    if (userCtx.loading || !me) {
        return <Loading></Loading>
    }

    // TODO translacje
    const logout = async () => {
        const confirmed = await confirm({
            title: "Czy na pewno chcesz się wylogować?",
            message: "Potwierdź, aby kontynuować.",
            confirmText: "Wyloguj się",
        })
        if (confirmed) {
            AuthService.logout();
        }
    }

    // TODO translacje
    const quickActions: MenuItem[] = [{
        label: "Admin panel",
        icon: Ico.SETTINGS,
        if: isDesktop && Util.hasPermission([UserRoles.ADMIN, UserRoles.SUPERADMIN], me),
        onClick: () => navigate(Path.ADMIN_DICTIONARIES)
    }, {
        label: "Moja lista",
        icon: Ico.BOOKMARK,
        if: myListedItems?.length,
        onClick: () => navigate(Path.MY_LIST)
    }, {
        label: t("pwa.install"),
        if: isInstallable,
        icon: Ico.DOWNLOAD,
        onClick: install
    }, {
        label: "Znajdź technika",
        icon: Ico.SEARCH,
        onClick: () => navigate(Path.WORKERS_SEARCH)
    }, {
        label: "Przeglądaj oferty",
        icon: Ico.CATEGORIES,
        onClick: () => navigate(Path.OFFERS_SEARCH)
    }, {
        if: userCtx.meCtx?.workerProfile,
        icon: Ico.EDIT,
        label: "Mój profil technika",
        onClick: () => navigate(Path.getWorkerProfilePath(userCtx.meCtx!.workerProfile!.displayName)),
    }, {
        if: !userCtx.meCtx?.workerProfile,
        icon: Ico.ADD_USER,
        label: "Dodaj swój profil technika",
        onClick: () => navigate(Path.WORKER_FORM)
    }, {
        label: "Dodaj ofertę",
        icon: Ico.OFFER,
        onClick: () => navigate(Path.OFFER_FORM)
    }, {
        if: userCtx.meCtx?.offers?.length,
        icon: Ico.OFFER,
        label: "Moje oferty",
        onClick: () => navigate(Path.getOffersPath(me.uid))
    }, {
        icon: Ico.CHAT,
        label: "Wiadomości",
        onClick: () => navigate(Path.CHATS)
    }, {
        icon: Ico.FRIENDS,
        label: "Znajomi",
        onClick: () => navigate(Path.getFriendsPath(me.uid))
    }, {
        label: "Powiadomienia",
        icon: Ico.NOTIFICATION,
        onClick: () => navigate(Path.NOTIFICATIONS)
    }, {
        label: "Ustawienia",
        icon: Ico.SETTINGS,
        onClick: () => navigate(Path.SETTINGS)
    }, {
        label: "Wyloguj się",
        icon: Ico.SIGN_OUT,
        onClick: logout
    }]

    return (<div className="w-full">

        <NotificationsGlobalBar />

        <UserProfileItem user={me}></UserProfileItem>

        <EmailVerificationWarning></EmailVerificationWarning>

        <ListUi items={quickActions} itemClassName="m-font py-3"></ListUi>

        <RecentViewedWorkers></RecentViewedWorkers>

        <RecentViewedOffers></RecentViewedOffers>

        <div className="px-5">
            <ReportForm />
        </div>

    </div>)
}

export default DashboardView;