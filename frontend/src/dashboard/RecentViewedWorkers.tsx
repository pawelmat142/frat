import { WorkerI } from "@shared/interfaces/WorkerI";
import WorkerRecentViewListItem from "employee/components/ListItems/WorkerRecentViewListItem";
import { useUserContext } from "user/UserProvider";

const RecentViewedWorkers: React.FC = () => {

    const userCtx = useUserContext();

    if (!userCtx.meCtx?.recentViewedWorkers?.length) {
        return null;
    }

    // TODO translate
    return (<div className="pt-10">

        <div className="px-5 pb-3 secondary-text">Ostatnio przeglądani technicy:</div>

        {userCtx.meCtx.recentViewedWorkers.map(item => {
            const worker = item.data as WorkerI;
            return <div key={item.id} className="py-2">
                <WorkerRecentViewListItem worker={worker} date={item.listedAt} disableDefaultBorder/>
            </div>
        })}

    </div>)
}

export default RecentViewedWorkers;