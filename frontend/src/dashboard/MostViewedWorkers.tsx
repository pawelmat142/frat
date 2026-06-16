import WorkerRecentViewListItem from "employee/components/ListItems/WorkerRecentViewListItem";
import TileSection from "employee/components/TileSection";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";

const MostViewedWorkers: React.FC = () => {

    const userCtx = useUserContext();
    const { t } = useTranslation();

    const workers = userCtx.meCtx?.mostViewedProfiles?.sort((a, b) => {
        a.uniqueViewsCount = a.uniqueViewsCount ?? 0;
        b.uniqueViewsCount = b.uniqueViewsCount ?? 0;
        return b.uniqueViewsCount - a.uniqueViewsCount;
    }) ?? [];

    if (!workers?.length) {
        return null;
    }

    return <TileSection title={t("user.mostViewedProfiles")}>
        {workers.map(worker => {
            return <div key={worker.workerId}>
                <WorkerRecentViewListItem worker={worker} date={worker.createdAt} disableDefaultBorder />
            </div>
        })}
    </TileSection>
}

export default MostViewedWorkers;