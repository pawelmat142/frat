import Loading from "global/components/Loading";
import ListUi from "global/components/ui/ListUi";
import { Ico } from "global/icon.def";
import NotificationsGlobalBar from "notification/components/NotificationsGlobalBar";
import { Path } from "../path";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { AuthService } from "auth/services/AuthService";
import { useConfirm } from "global/providers/PopupProvider";
import { BtnModes, MenuItem } from "global/interface/controls.interface";
import ReportForm from "global/components/ReportForm";
import UserProfileItem from "user/components/UserProfileItem";
import { useTranslation } from "react-i18next";
import EmailVerificationWarning from "./EmailVerificationWarning";
import { usePwaInstall } from "global/hooks/usePwaInstall";
import { Util } from "@shared/utils/util";
import { UserRole, UserRoles } from "@shared/interfaces/UserI";
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
import { useState, useEffect } from "react";

// TODO remove - temporary debug
const FONT_STACK = [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
];

function detectActualFont(): string {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return "unknown (no canvas)";

    const testText = "mmmmmmmmmmlli";
    const size = "72px";

    ctx.font = `${size} monospace`;
    const baseline = ctx.measureText(testText).width;

    for (const font of FONT_STACK) {
        ctx.font = `${size} '${font}', monospace`;
        if (ctx.measureText(testText).width !== baseline) {
            return font;
        }
    }
    return "monospace (brak dopasowania)";
}

const FontDebugOverlay: React.FC = () => {
    const [visible, setVisible] = useState(true);
    const [resolvedFont, setResolvedFont] = useState("");
    const [declaredStack, setDeclaredStack] = useState("");

    useEffect(() => {
        setDeclaredStack(getComputedStyle(document.body).fontFamily);
        setResolvedFont(detectActualFont());
    }, []);

    if (!visible) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: 80,
            left: 8,
            zIndex: 9999,
            background: "rgba(0,0,0,0.88)",
            color: "#fff",
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 11,
            maxWidth: "92vw",
            lineHeight: 1.6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        }}>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>🔤 Font debug</div>
            <div>
                <span style={{ opacity: 0.6 }}>Używany font: </span>
                <span style={{ color: "#4ade80", fontWeight: "bold" }}>{resolvedFont}</span>
            </div>
            <div style={{ marginTop: 4 }}>
                <span style={{ opacity: 0.6 }}>Stos CSS: </span>
                <span style={{ opacity: 0.75, wordBreak: "break-all" }}>{declaredStack}</span>
            </div>
            <button
                onClick={() => setVisible(false)}
                style={{
                    marginTop: 8,
                    background: "rgba(255,255,255,0.15)",
                    border: "none",
                    borderRadius: 4,
                    color: "#fff",
                    padding: "3px 10px",
                    cursor: "pointer",
                    fontSize: 11,
                }}
            >
                Zamknij
            </button>
        </div>
    );
};

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

        <FontDebugOverlay />

        <NotificationsGlobalBar />

        <UserProfileItem user={me} topRightComponent={menu}></UserProfileItem>

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