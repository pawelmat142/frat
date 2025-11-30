import { OfferI } from "@shared/interfaces/OfferI";
import { Util } from "@shared/utils/util";
import { useTranslation } from "react-i18next";
import { Utils } from "global/utils";

interface OfferDetailsTileProps {
    offer: OfferI;
}

const OfferDetailsTile: React.FC<OfferDetailsTileProps> = ({ offer }) => {
    const { t } = useTranslation();

    const category: string = Utils.capitalizeFirstLetter(t(`dictionary.WORK_CATEGORY.NAME.${offer.category}`));
    const slots = getSlots();

    function getSlots(): string | null {
        if (!offer.availableSlots) {
            return null;
        }
        if (offer.acceptedSlots) {
            return `${t('offer.availableSlots')}: ${offer.availableSlots - offer.acceptedSlots} / ${offer.availableSlots}`;
        }
        return `${t('offer.availableSlots')}: ${offer.availableSlots}`;
    }

    function getSalaryRange(): string | null {
        if (!offer.hourlySalaryStart && !offer.monthlySalaryStart) {
            return null;
        }
        let result = `${t('common.from')}: `;
        if (offer.hourlySalaryStart) {
            result += `${offer.hourlySalaryStart}`;
            if (offer.hourlySalaryEnd) {
                result += ` ${t('common.to')} ${offer.hourlySalaryEnd}`;
            }
            result += ` ${offer.currency} / ${t('common.hour')}`;
        }
        if (offer.monthlySalaryStart) {
            if (offer.hourlySalaryStart) {
                result += ` ${t('common.or') || 'or'} `;
            }
            result += `${offer.monthlySalaryStart}`;
            if (offer.monthlySalaryEnd) {
                result += ` ${t('common.to')} ${offer.monthlySalaryEnd}`;
            }
            result += ` ${offer.currency} / ${t('common.month')}`;
        }
        return result;
    }
    
    const salary = getSalaryRange();

    return (
        <div className="square-tile col-tile big offer-details-tile">
            <div className="w-full flex justify-between">
                <div className="mb-1 primary-text">{category}</div>
                {!!slots && (<div className="xs-font secondary-text">{slots}</div>)}
            </div>
            {!!offer.displayName && (<div className="small-font primary-text">{offer.displayName}</div>)}
            {!!offer.description && (<div className="small-font secondary-text">{offer.description}</div>)}

            {!!salary && (<div className="mt-2 small-font primary-text">{salary}</div>)}

            <div className="flex w-full justify-between mt-2">
                <span className="xs-font secondary-text">{t('offer.views')}: {offer.views?.length || 0}</span>
                <span className="xs-font secondary-text">{t('offer.likes')}: {offer.likes?.length || 0}</span>
                <div className="xs-font secondary-text">{t('offer.created')}: {Util.displayDate(offer.createdAt)}</div>
            </div>
        </div>
    );
};

export default OfferDetailsTile;
