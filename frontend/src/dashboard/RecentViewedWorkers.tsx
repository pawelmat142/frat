import { WorkerI } from "@shared/interfaces/WorkerI";
import WorkerRecentViewListItem from "employee/components/ListItems/WorkerRecentViewListItem";
import TileSection from "employee/components/TileSection";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";

const RecentViewedWorkers: React.FC = () => {

    const userCtx = useUserContext();
    const { t } = useTranslation();

    if (!userCtx.meCtx?.recentViewedWorkers?.length) {
        return null;
    }

    return <TileSection title={t("employeeProfile.recentlySeen")}>
        {userCtx.meCtx.recentViewedWorkers.map(item => {
            const worker = item.data as WorkerI;
            return <div key={item.id}>
                <WorkerRecentViewListItem worker={worker} date={item.listedAt} disableDefaultBorder />
            </div>
        })}
    </TileSection>
}

export default RecentViewedWorkers;