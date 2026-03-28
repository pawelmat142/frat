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

const DashboardView: React.FC = () => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const confirm = useConfirm()
    const { isInstallable, install } = usePwaInstall();
    
    const me = userCtx.me;

    if (userCtx.loading || !me) {
        return <Loading></Loading>
    }

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
        label: "Dodaj swój profil technika`",
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

        <UserProfileItem user={me}></UserProfileItem>

        <NotificationsGlobalBar />

        <EmailVerificationWarning></EmailVerificationWarning>

        <ListUi items={quickActions} itemClassName="m-font py-3"></ListUi>


        <div className="px-5 mt-10">
            <div>Proponowane oferty:</div>
            <div>kiedyś...</div>
        </div>

        <div className="px-5">
            <ReportForm />
        </div>

    </div>)
}

export default DashboardView;