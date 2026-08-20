import { OfferI } from "@shared/interfaces/OfferI";
import { PositionUtil } from "@shared/utils/PositionUtil";
import DateDisplay from "global/components/ui/DateDisplay";
import { Ico } from "global/icon.def";
import { useTranslation } from "react-i18next";
import { IconType } from "react-icons";
import { useUserContext } from "user/UserProvider";

interface StatItem {
    icon: IconType,
    display: string | number
    if: any
}

interface Props {
    offer: OfferI,
    showStartsFrom?: boolean
}

const iconSize = 14;

const OfferStatItems: React.FC<Props> = ({ offer, showStartsFrom }) => {
    const userCtx = useUserContext();
    const { t } = useTranslation();

    const getDistanceInfo = (): string => {
        if (!offer.point) {
            return '';
        }
        return userCtx.getDistanceInfo(PositionUtil.fromGeoPoint(offer.point));
    }

    const distance = getDistanceInfo();
    const items: StatItem[] = [{
        icon: Ico.VIEWS,
        if: true,
        display: offer.uniqueViewsCount || 0,
    }, {
        icon: Ico.STAR,
        if: offer.favoritesCount,
        display: offer.favoritesCount || 0,
    }, {
        icon: Ico.MARKER,
        if: distance,
        display: distance,
    }];

    const startsFrom = (showStartsFrom && offer.startDate) ? <span className="xs-font">
        <span className="secondary-text">{t('common.from')} </span>
        <span>{DateDisplay({ date: offer.startDate, t, showYearIfNotCurrent: true })}</span>
    </span> : null;

    return <div className="flex items-center gap-2 letter-spacing-0">
        {startsFrom}
        {items.filter(i => !!i.if).map(i => (
            <div className="flex items-center gap05" key={i.icon.toString()}>
                <i.icon size={iconSize} className="secondary-text" />
                <span className="xs-font">{i.display}</span>
            </div>
        ))}
    </div>;
}

export default OfferStatItems;