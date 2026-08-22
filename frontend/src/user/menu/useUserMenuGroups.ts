import { Path } from "../../path";
import { Ico } from "global/icon.def";
import { MenuGroup } from "global/interface/controls.interface";
import { useConfirm } from "global/providers/PopupProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { AuthService } from "auth/services/AuthService";
import { useUserContext } from "user/UserProvider";
import { useWorkersSearch } from "employee/views/search/WorkersSearchProvider";
import { useOfferSearch } from "offer/views/search/OfferSearchProvider";
import { usePwaInstall } from "global/hooks/usePwaInstall";
import { UserRoles } from "@shared/interfaces/UserI";
import { Util } from "@shared/utils/util";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface UseUserMenuGroupsOptions {
    onAction?: () => void;
}

export const useUserMenuGroups = ({ onAction }: UseUserMenuGroupsOptions = {}): MenuGroup[] => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { me, meCtx } = useUserContext();
    const { isDesktop } = useGlobalContext();
    const workerSearchCtx = useWorkersSearch();
    const offerSearchCtx = useOfferSearch();
    const { isInstallable, install } = usePwaInstall();
    const confirm = useConfirm();

    const runAction = (action: () => void | Promise<void>) => () => {
        onAction?.();
        void action();
    };

    const logout = async () => {
        const confirmed = await confirm({
            title: t("signin.logoutPopupTitle"),
            message: t("signin.logoutPopupMessage"),
            confirmText: t("signin.logoutPopupConfirm"),
        });
        if (confirmed) await AuthService.logout();
    };

    if (!me) return [];

    const isAdmin = Util.hasPermission([UserRoles.ADMIN, UserRoles.SUPERADMIN], me);
    const trainingAccess = Util.hasPermission(
        [UserRoles.TRAINING_PROVIDER, UserRoles.ADMIN, UserRoles.SUPERADMIN],
        me,
    );

    return [
        {
            title: t("account.account"),
            items: [
                { label: "Admin panel", icon: Ico.SETTINGS, if: isDesktop && isAdmin, onClick: runAction(() => navigate(Path.ADMIN_DICTIONARIES)) },
                { label: t("pwa.install"), icon: Ico.DOWNLOAD, if: isInstallable, onClick: runAction(install) },
                { label: t("notification.header"), icon: Ico.NOTIFICATION, onClick: runAction(() => navigate(Path.NOTIFICATIONS)) },
                { label: t("user.myList"), icon: Ico.STAR, onClick: runAction(() => navigate(Path.MY_LIST)) },
                { label: t("chat.chats"), icon: Ico.CHAT, onClick: runAction(() => navigate(Path.CHATS)) },
                { label: t("account.friends"), icon: Ico.FRIENDS, onClick: runAction(() => navigate(Path.getFriendsPath(me.uid))) },
            ],
        },
        {
            title: t("nav.employees"),
            items: [
                { label: t("employeeProfile.search"), icon: Ico.SEARCH, onClick: runAction(workerSearchCtx.navToSearch) },
                { label: t("user.myWorkerProfile"), icon: Ico.EDIT, if: !!meCtx?.workerProfile, onClick: runAction(() => navigate(Path.getWorkerProfilePath(meCtx!.workerProfile!.displayName))) },
                { label: t("user.addWorkerProfile"), icon: Ico.ADD_USER, if: !meCtx?.workerProfile, onClick: runAction(() => navigate(Path.WORKER_FORM)) },
                { label: t("training.myTrainings"), icon: Ico.TRAINING, if: trainingAccess && !!meCtx?.trainingProvider, onClick: runAction(() => navigate(Path.MY_TRAININGS)) },
                { label: t("training.provider.create"), icon: Ico.TRAINING, if: trainingAccess && !meCtx?.trainingProvider, onClick: runAction(() => navigate(Path.TRAINING_PROVIDER_FORM)) },
            ],
        },
        {
            title: t("nav.offers"),
            items: [
                { label: t("user.browseOffers"), icon: Ico.CATEGORIES, onClick: runAction(offerSearchCtx.navToSearch) },
                { label: t("user.addOffer"), icon: Ico.OFFER, onClick: runAction(() => navigate(Path.OFFER_FORM)) },
                { label: t("user.myOffers"), icon: Ico.OFFER, if: meCtx?.offers?.length, onClick: runAction(() => navigate(Path.getOffersPath(me.uid))) },
            ],
        },
        {
            items: [
                { label: t("common.settings"), icon: Ico.SETTINGS, onClick: runAction(() => navigate(Path.SETTINGS)) },
                { label: t("nav.about"), icon: Ico.COMPASS, onClick: runAction(() => navigate(Path.ABOUT)) },
                { label: t("signin.logout"), icon: Ico.SIGN_OUT, className: "error-color", onClick: runAction(logout) },
            ],
        },
    ];
};