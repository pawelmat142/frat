import { OfferI } from "@shared/interfaces/OfferI"
import { Path } from "../../../path";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThumbUp, Visibility } from "@mui/icons-material";
import ListItem from "global/components/ListItem";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import { PositionUtil } from "@shared/utils/PositionUtil";
import { DictionaryUtil } from "@shared/utils/DictionaryUtil";
import Chips, { ChipModes } from "global/components/chips/Chips";
import { AppConfig } from "@shared/AppConfig";

interface Props {
    offer: OfferI,
    first?: boolean,
    last?: boolean,
    disableDefaultBorder?: boolean
    rightSection?: React.ReactNode,
    className?: string
}

const MINIMUM_DISTANCE_FOR_DISPLAY_METERS = AppConfig.MINIMUM_DISTANCE_FOR_DISPLAY_METERS; 

const OfferListItem: React.FC<Props> = ({ offer, first, last, disableDefaultBorder, rightSection, className }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();

    const goToOfferView = () => {
        navigate(Path.getOfferPath(offer.offerId));
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
        <Chips
            chips={[t(DictionaryUtil.getTranslationKey('WORK_CATEGORY', offer.category))]}
            mode={ChipModes.SECONDARY}
        />
    ) : null;

    const topLeft = (
        <div>
            <div className="font-medium truncate">
                {offer.displayName || t('offer.untitled')}
            </div>
        </div>
    );

    const bottomLeft = <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-3">
            {categoryChip}
            <div>
                <Visibility fontSize="inherit" className="secondary-text mr-1" />
                <span className="xs-font">{offer.uniqueViewsCount || 0}</span>
            </div>
            <div>
                <ThumbUp fontSize="inherit" className="secondary-text mr-1" />
                <span className="xs-font">{offer.likes?.length || 0}</span>
            </div>

            {!!distance && (
                <div className="flex items-center">
                    <Ico.MARKER size={14} className="secondary-text mr-1" />
                    <span className="xs-font">{distance}</span>
                </div>
            )}
        </div>
    </div>

    return (
        <div onClick={goToOfferView} className={className}>
            <ListItem
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
