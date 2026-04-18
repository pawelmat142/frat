import { ThumbUp, Visibility } from "@mui/icons-material";
import { WorkerI, WorkerWithMutualFriends } from "@shared/interfaces/WorkerI";
import { PositionUtil } from "@shared/utils/PositionUtil";
import { Ico } from "global/icon.def";
import { IconType } from "react-icons";
import { useUserContext } from "user/UserProvider";

interface StatItem {
    icon: IconType,
    display: string | number
    if: any
}

interface Props {
    worker: WorkerI,
}

const iconSize = 14;

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

    const items: StatItem[] = [{
        icon: Ico.VIEWS,
        if: true,
        display: worker.uniqueViewsCount || 0,
    }, {
        icon: Ico.LIKES,
        if: worker.likes?.length,
        display: worker.likes?.length || 0,
    }, {
        icon: Ico.FRIENDS,
        if: mutualFriendsUids.length,
        display: mutualFriendsUids.length,
    }, {
        icon: Ico.MARKER,
        if: distance,
        display: distance,
    }]

    return (<div className="flex items-center gap-2">

        {items.filter(i => !!i.if).map(i => {
            return (<div className="flex items-center gap05" key={i.icon.toString()}>
                <i.icon size={iconSize} className="secondary-text" />
                <span className="xs-font">{i.display}</span>
            </div>)
        })}
    </div>)
}

export default WorkerStatItems;
