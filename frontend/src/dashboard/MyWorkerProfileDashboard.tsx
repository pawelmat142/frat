import WorkerRecentViewListItem from "employee/components/ListItems/WorkerRecentViewListItem";
import { Ico } from "global/icon.def";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { Path } from "../path";
import DesktopDashSection from "./DesktopDashSection";

const MyWorkerProfileDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { meCtx } = useUserContext();
    const workerProfile = meCtx?.workerProfile;

    if (workerProfile) {
        return (
            <DesktopDashSection
                title={t("user.myWorkerProfile")}
                onClick={() => navigate(Path.getWorkerProfilePath(workerProfile.displayName))}
            >
                <WorkerRecentViewListItem worker={workerProfile} disableDefaultBorder />
            </DesktopDashSection>
        );
    }

    return (
        <button
            type="button"
            className="dashboard-action-tile ripple"
            onClick={() => navigate(Path.WORKER_FORM)}
        >
            <Ico.ADD_USER />
            <span className="dashboard-action-tile-label">{t("user.addWorkerProfile")}</span>
            <Ico.CHEVRON_RIGHT />
        </button>
    );
};

export default MyWorkerProfileDashboard;