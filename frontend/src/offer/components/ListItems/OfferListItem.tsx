import { OfferI } from "@shared/interfaces/OfferI"
import { Path } from "../../../path";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ListItem from "global/components/ListItem";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import { PositionUtil } from "@shared/utils/PositionUtil";
import { AppConfig } from "@shared/AppConfig";
import DateDisplay from "global/components/ui/DateDisplay";
import AvatarMock from "global/components/AvatarMock";
import CategoriesChips from "global/components/chips/CategoriesChips";

interface Props {
    offer: OfferI,
    first?: boolean,
    last?: boolean,
    disableDefaultBorder?: boolean
    rightSection?: React.ReactNode,
    className?: string
}

const MINIMUM_DISTANCE_FOR_DISPLAY_METERS = AppConfig.MINIMUM_DISTANCE_FOR_DISPLAY_METERS;

const AVATAR_COLOR_BY_CATEGORY: Record<string, string> = {
    ONSHORE: '#f97316',    // orange (distinct)
    OFFSHORE: '#059669',   // emerald green (distinct from blue)
    WIND: '#4338ca',       // indigo/purple (distinct)
};
const DEFAULT_AVATAR_COLOR = '#6B7280'; // neutral gray fallback

const OfferListItem: React.FC<Props> = ({ offer, first, last, disableDefaultBorder, rightSection, className }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();

    const goToOfferView = () => {
        navigate(Path.getOfferPath(offer.offerId));
    }

    const getAvatarColor = (category?: string): string => {
        if (!category) {
            return DEFAULT_AVATAR_COLOR;
        }
        return AVATAR_COLOR_BY_CATEGORY[category] ?? DEFAULT_AVATAR_COLOR;
    }

    const getDistanceInfo = (): string => {
        if (!userCtx.position || !offer.point) {
            return '';
        }
        const meters = PositionUtil.getDistanceFromToInMeters(userCtx.position, PositionUtil.fromGeoPoint(offer.point));

        if (meters < MINIMUM_DISTANCE_FOR_DISPLAY_METERS) {
            return t("others.lessThan", { distance: MINIMUM_DISTANCE_FOR_DISPLAY_METERS / 1000, unit: 'km' });
        }
        return `${PositionUtil.displayDistance(meters)}`;
    }

    const distance = getDistanceInfo();

    const categoryChip = offer.category ? (
        <CategoriesChips categories={[offer.category]} smaller />
    ) : null;

    const topLeft = (
        <div className="flex items-center gap-2">
            <div className="font-medium truncate">
                {offer.displayName || t('offer.untitled')}
            </div>
            {categoryChip}
        </div>
    );

    const startsFrom = offer.startDate ? <span className="xs-font">
        <span className="secondary-text">{t('common.from')} </span>
        <span>{DateDisplay({ date: offer.startDate, t, showYearIfNotCurrent: true })}</span>
    </span> : null;

    const bottomLeft = <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-3">
            {startsFrom}
            <div className="flex items-center">
                <Ico.VIEWS size={14} className="secondary-text mr-1" />
                <span className="xs-font">{offer.uniqueViewsCount || 0}</span>
            </div>
            <div className="flex items-center">
                <Ico.STAR size={14} className="secondary-text mr-1" />
                <span className="xs-font">{offer.favoritesCount || 0}</span>
            </div>

            {!!distance && (
                <div className="flex items-center">
                    <Ico.MARKER size={14} className="secondary-text mr-1" />
                    <span className="xs-font">{distance}</span>
                </div>
            )}
        </div>
    </div>

    const avatarColor = getAvatarColor(offer.category);

    const avatarMock = offer.avatarRef ? undefined : <AvatarMock
        color={avatarColor}
        letter={offer.displayName ? offer.displayName.charAt(0) : '?'}
    ></AvatarMock>

    return (
        <div onClick={goToOfferView} className={className}>
            <ListItem
                imgUrl={offer.avatarRef ? offer.avatarRef.url : undefined}
                imgComponent={avatarMock}
                topLeft={topLeft}
                bottomLeft={bottomLeft}
                first={first}
                last={last}
                rightSection={rightSection}
                disableDefaultBorder={disableDefaultBorder}
            />
        </div>
    )

}

export default OfferListItem;
