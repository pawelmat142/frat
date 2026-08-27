import { Ico } from "global/icon.def";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { Path } from "../../path";
import EmailVerificationWarning from "../EmailVerificationWarning";
import FriendsDashboard from "../FriendsDashboard";
import LatestOffersDashboard from "../LatestOffersDashboard";
import MostViewedWorkers from "../MostViewedWorkers";
import MyListDashboard from "../MyListDashboard";
import MyOffersDashboard from "../MyOffersDashboard";
import RecentViewedOffers from "../RecentViewedOffers";
import RecentViewedWorkers from "../RecentViewedWorkers";
import MyWorkerProfileDashboard from "../MyWorkerProfileDashboard";

const DesktopDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { me } = useUserContext();
    const firstName = me?.displayName?.split(/\s+/)[0] || "";

    return (
        <div className="desktop-dashboard">
            <div className="desktop-dashboard-welcome">
                {/* TODO: translations */}
                {/* TODO: avatar edit — see AVATAR_EDIT_UX.md; usunąć ten komentarz i plik po implementacji */}
                <h1 className="desktop-dashboard-welcome-title">Cześć, {firstName}</h1>
            </div>

            <EmailVerificationWarning />

            <div className="desktop-dashboard-grid">
                <div className="desktop-dashboard-col">
                    <MyWorkerProfileDashboard />
                    <MyListDashboard />
                    <FriendsDashboard />
                    <MyOffersDashboard />
                    <button
                        type="button"
                        className="dashboard-action-tile ripple"
                        onClick={() => navigate(Path.SETTINGS)}
                    >
                        <Ico.SETTINGS />
                        <span className="dashboard-action-tile-label">{t("common.settings")}</span>
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