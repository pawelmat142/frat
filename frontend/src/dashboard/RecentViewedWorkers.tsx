import { WorkerI } from "@shared/interfaces/WorkerI";
import WorkerRecentViewListItem from "employee/components/ListItems/WorkerRecentViewListItem";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";

const RecentViewedWorkers: React.FC = () => {

    const userCtx = useUserContext();
    const { t } = useTranslation();

    if (!userCtx.meCtx?.recentViewedWorkers?.length) {
        return null;
    }

    return (<div className="pt-7">

        <div className="px-5 pb-2 secondary-text">{t("employeeProfile.recentlySeen")}:</div>

        {userCtx.meCtx.recentViewedWorkers.map(item => {
            const worker = item.data as WorkerI;
            return <div key={item.id} className="py-2">
                <WorkerRecentViewListItem worker={worker} date={item.listedAt} disableDefaultBorder/>
            </div>
        })}

    </div>)
}

export default RecentViewedWorkers;