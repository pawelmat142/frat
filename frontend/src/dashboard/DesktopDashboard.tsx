import WorkerRecentViewListItem from "employee/components/ListItems/WorkerRecentViewListItem";
import { Ico } from "global/icon.def";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { Path } from "../path";
import DesktopDashSection from "./DesktopDashSection";
import EmailVerificationWarning from "./EmailVerificationWarning";
import FriendsDashboard from "./FriendsDashboard";
import LatestOffersDashboard from "./LatestOffersDashboard";
import MostViewedWorkers from "./MostViewedWorkers";
import MyListDashboard from "./MyListDashboard";
import MyOffersDashboard from "./MyOffersDashboard";
import RecentViewedOffers from "./RecentViewedOffers";
import RecentViewedWorkers from "./RecentViewedWorkers";

const DesktopDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { me, meCtx } = useUserContext();
    const firstName = me?.displayName?.split(/\s+/)[0] || "";
    const workerProfile = meCtx?.workerProfile;

    return (
        <div className="desktop-dashboard">
            <div className="desktop-dashboard-welcome">
                {/* TODO: translations */}
                {/* TODO: avatar edit — mobile dashboard uses EDIT_AVATAR_FLAG_KEY on UserProfileItem */}
                <h1 className="desktop-dashboard-welcome-title">Cześć, {firstName}</h1>
            </div>

            <EmailVerificationWarning />

            <div className="desktop-dashboard-grid">
                <div className="desktop-dashboard-col">
                    {workerProfile ? (
                        <DesktopDashSection
                            title={t("user.myWorkerProfile")}
                            onClick={() => navigate(Path.getWorkerProfilePath(workerProfile.displayName))}
                        >
                            <WorkerRecentViewListItem worker={workerProfile} disableDefaultBorder />
                        </DesktopDashSection>
                    ) : (
                        <button
                            type="button"
                            className="desktop-dash-settings ripple"
                            onClick={() => navigate(Path.WORKER_FORM)}
                        >
                            <Ico.ADD_USER />
                            <span className="desktop-dash-settings-label">{t("user.addWorkerProfile")}</span>
                            <Ico.CHEVRON_RIGHT />
                        </button>
                    )}
                    <MyListDashboard />
                    <FriendsDashboard />
                    <MyOffersDashboard />
                    <button
                        type="button"
                        className="desktop-dash-settings ripple"
                        onClick={() => navigate(Path.SETTINGS)}
                    >
                        <Ico.SETTINGS />
                        <span className="desktop-dash-settings-label">{t("common.settings")}</span>
                        <Ico.CHEVRON_RIGHT />
                    </button>
                </div>
                <div className="desktop-dashboard-col">
                    <LatestOffersDashboard />
                    <MostViewedWorkers />
                    <RecentViewedOffers />
                    <RecentViewedWorkers />
                </div>
            </div>
        </div>
    );
};

export default DesktopDashboard;
