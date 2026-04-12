import { ThumbUp, Visibility } from "@mui/icons-material";
import { AppConfig } from "@shared/AppConfig";
import { OfferI, OfferStatuses } from "@shared/interfaces/OfferI";
import { DateUtil } from "@shared/utils/DateUtil";
import { DictionaryUtil } from "@shared/utils/DictionaryUtil";
import { PositionUtil } from "@shared/utils/PositionUtil";
import Chips, { ChipModes } from "global/components/chips/Chips";
import { Ico } from "global/icon.def";
import { StringUtil } from "global/utils/StringUtil";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";

interface OfferDetailsTileProps {
    offer: OfferI;
}

const MINIMUM_DISTANCE_FOR_DISPLAY_METERS = AppConfig.MINIMUM_DISTANCE_FOR_DISPLAY_METERS; 

const OfferDetailsTile: React.FC<OfferDetailsTileProps> = ({ offer }) => {
    const { t } = useTranslation();
    const userCtx = useUserContext();

    const category: string = StringUtil.capitalizeFirstLetter(t(`dictionary.WORK_CATEGORY.NAME.${offer.category}`));

    const categoryChip = offer.category ? (
        <Chips
            chips={[t(DictionaryUtil.getTranslationKey('WORK_CATEGORY', offer.category))]}
            mode={ChipModes.SECONDARY}
        />
    ) : null;

    function getSlots(): string | null {
        if (!offer.availableSlots) {
            return null;
        }
        if (offer.acceptedSlots) {
            return `${t('offer.availableSlots')}: ${offer.availableSlots - offer.acceptedSlots} / ${offer.availableSlots}`;
        }
        return `${t('offer.availableSlots')}: ${offer.availableSlots}`;
    }

    function displayStatus(): string {
        switch (offer.status) {
            case OfferStatuses.ACTIVE:
                return t('offer.statusActive');
            case OfferStatuses.INACTIVE:
                return t('offer.statusInactive');
            default:
                return offer.status;
        }
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

    return (
        <div className="square-tile col-tile big offer-details-tile">
            {/* <div className="w-full flex justify-between">
                <div className="mb-1 primary-text">{category}</div>
                <div className="text-right">
                    <div className="xs-font primary-text mt-1">{displayStatus()}</div>
                </div>
            </div> */}
            {!!offer.displayName && (<div className="primary-text mb-5">{offer.displayName}</div>)}
            {!!offer.description && (<div className="s-font secondary-text text-left">{offer.description}</div>)}


            <div className="mt-2 s-font">
                <span className="secondary-text">{t('offer.salary')} </span>
                <span className="primary-text"> {offer.salary} {offer.currency}</span>
            </div>

            <div className="mt-2 s-font flex items-center gap-1">
                <span className="secondary-text">{t('offer.workCategory')} </span>
                <span className="primary-text"> {categoryChip}</span>
            </div>

            <div className="flex w-full justify-between mt-2">
                <span className="xs-font secondary-text">
                    <Visibility fontSize="small" className="secondary-text mr-1" />
                    {t('offer.views')}: {offer.uniqueViewsCount || 0}
                </span>
                <span className="xs-font secondary-text">
                    {t('offer.likes')}: {offer.likes?.length || 0}
                    <ThumbUp fontSize="small" className="secondary-text ml-1" />
                </span>
            </div>

            <div className="flex w-full justify-between mt-2">
                <div className="flex items-center secondary-text">
                    {!!distance && (<>
                        <Ico.MARKER size={14} className="mr-1" />
                        <span className="xs-font">{t('common.distance')}: </span>
                        <span className="primary-text s-font"> {distance}</span>
                    </>
                    )}
                </div>
                <div className="xs-font secondary-text">{t('offer.created')}: {DateUtil.displayDate(offer.createdAt)}</div>
            </div>
        </div>
    );
};

export default OfferDetailsTile;
