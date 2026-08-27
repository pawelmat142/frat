import { WorkerI } from "@shared/interfaces/WorkerI";
import WorkerRecentViewListItem from "employee/components/ListItems/WorkerRecentViewListItem";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import { useWorkersSearch } from "employee/views/search/WorkersSearchProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { getDashboardLimit } from "./dashboard.def";
import DesktopDashSection from "./DesktopDashSection";

const RecentViewedWorkers: React.FC = () => {
    const userCtx = useUserContext();
    const { t } = useTranslation();
    const workerSearchCtx = useWorkersSearch();
    const { isDesktop } = useGlobalContext();
    const items = (userCtx.meCtx?.recentViewedWorkers ?? []).slice(0, getDashboardLimit(isDesktop));

    if (!items.length && !isDesktop) {
        return null;
    }

    return (
        <DesktopDashSection
            title={t("employeeProfile.recentlySeen")}
            empty={isDesktop && !items.length ? {
                text: "Nie oglądałeś jeszcze żadnych techników.",
                actionTitle: "Szukaj techników",
                onClick: workerSearchCtx.navToSearch,
            } : undefined}
        >
            {items.map(item => {
                const worker = item.data as WorkerI;
                return (
                    <div key={item.id}>
                        <WorkerRecentViewListItem worker={worker} disableDefaultBorder />
                    </div>
                );
            })}
        </DesktopDashSection>
    );
};

export default RecentViewedWorkers;