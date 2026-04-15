import { ThumbUp, Visibility } from "@mui/icons-material";
import { WorkerI, WorkerWithMutualFriends } from "@shared/interfaces/WorkerI";
import { PositionUtil } from "@shared/utils/PositionUtil";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";

interface Props {
    worker: WorkerI,
}

const WorkerStatItems: React.FC<Props> = ({ worker }) => {

    const userCtx = useUserContext();
    
    const getMutualFriendsUids = (worker: WorkerI): string[] => {
        const w = worker as WorkerWithMutualFriends;
        return w.mutualFriendsUids || [];
    }
    const mutualFriendsUids = getMutualFriendsUids(worker);

    const getDistanceInfo = (): string => {
        if (!worker.point) {
            return '';
        }
        return userCtx.getDistanceInfo(PositionUtil.fromGeoPoint(worker.point));
    }

    const distance = getDistanceInfo();


    return (<div className="flex items-center gap-3">
        <div>
            <Visibility fontSize="inherit" className="secondary-text mr-1" />
            <span className="xs-font">{worker.uniqueViewsCount || 0}</span>
        </div>
        <div>
            <ThumbUp fontSize="inherit" className="secondary-text mr-1" />
            <span className="xs-font">{worker.likes?.length || 0}</span>
        </div>

        {!!mutualFriendsUids.length && (
            <div className="flex items-center">
                <Ico.FRIENDS size={14} className="secondary-text mr-1" />
                <span className="xs-font">{mutualFriendsUids.length}</span>
            </div>
        )}

        {!!distance && (
            <div className="flex items-center">
                <Ico.MARKER size={14} className="secondary-text mr-1" />
                <span className="xs-font">{distance}</span>
            </div>
        )}
    </div>)
}

export default WorkerStatItems;
