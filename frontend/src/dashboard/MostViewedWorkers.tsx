import WorkerRecentViewListItem from "employee/components/ListItems/WorkerRecentViewListItem";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import { useWorkersSearch } from "employee/views/search/WorkersSearchProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { getDashboardLimit } from "./dashboard.def";
import DesktopDashSection from "./DesktopDashSection";

const MostViewedWorkers: React.FC = () => {
    const userCtx = useUserContext();
    const { t } = useTranslation();
    const workerSearchCtx = useWorkersSearch();
    const { isDesktop } = useGlobalContext();
    const workers = (userCtx.meCtx?.mostViewedProfiles ?? [])
        .slice()
        .sort((a, b) => (b.uniqueViewsCount ?? 0) - (a.uniqueViewsCount ?? 0))
        .slice(0, getDashboardLimit(isDesktop));

    if (!workers.length && !isDesktop) {
        return null;
    }

    return (
        <DesktopDashSection
            title={t("user.mostViewedProfiles")}
            empty={isDesktop && !workers.length ? {
                text: "Brak najczęściej oglądanych techników.",
                actionTitle: "Szukaj techników",
                onClick: workerSearchCtx.navToSearch,
            } : undefined}
        >
            {workers.map(worker => (
                <div key={worker.workerId}>
                    <WorkerRecentViewListItem worker={worker} disableDefaultBorder />
                </div>
            ))}
        </DesktopDashSection>
    );
};

export default MostViewedWorkers;