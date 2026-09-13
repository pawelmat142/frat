import { WorkerI, WorkerWithMutualFriends } from "@shared/interfaces/WorkerI";
import { PositionUtil } from "@shared/utils/PositionUtil";
import DateDisplay from "global/components/ui/DateDisplay";
import { Ico } from "global/icon.def";
import { useTranslation } from "react-i18next";
import { IconType } from "react-icons";
import { useUserContext } from "user/UserProvider";

interface StatItem {
    id: 'views' | 'favourites' | 'mutualFriends' | 'distance';
    icon: IconType,
    label: string;
    display: string | number;
    if: any;
}

interface Props {
    worker: WorkerI;
    showStartsFrom?: boolean;
    detailed?: boolean;
}

const iconSize = 14;

const WorkerStatItems: React.FC<Props> = ({ worker, showStartsFrom, detailed = false }) => {

    const userCtx = useUserContext();
    const { t } = useTranslation();

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
        id: 'views',
        icon: Ico.VIEWS,
        label: t('employeeProfile.views'),
        if: true,
        display: worker.uniqueViewsCount || 0,
    }, {
        id: 'favourites',
        icon: Ico.STAR,
        label: t('user.myList'),
        if: worker.favoritesCount,
        display: worker.favoritesCount || 0,
    }, {
        id: 'mutualFriends',
        icon: Ico.FRIENDS,
        label: t('employeeProfile.mutualFriends', 'Mutual friends'),
        if: mutualFriendsUids.length,
        display: mutualFriendsUids.length,
    }, {
        id: 'distance',
        icon: Ico.MARKER,
        label: t('common.distance'),
        if: distance,
        display: distance,
    }]

    const startsFrom = (showStartsFrom && worker.startDate) ? <span className="xs-font">
        <span className="secondary-text">{t('common.from')} </span>
        <span>{DateDisplay({ localDateString: worker.startDate, t, showYearIfNotCurrent: true })}</span>
    </span> : null;

    return (<div className="flex items-center gap-2 letter-spacing-0">

        {startsFrom}

        {items.filter(i => !!i.if && (!detailed || i.id !== 'distance')).map(i => {
            return (<div className="flex items-center gap05" key={i.id}>
                <i.icon size={iconSize} className="secondary-text" />
                <span className="xs-font">{detailed ? `${i.label}: ${i.display}` : i.display}</span>
            </div>)
        })}
    </div>)
}

export default WorkerStatItems;
