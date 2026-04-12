import { OfferI } from "@shared/interfaces/OfferI";
import OfferRecentViewListItem from "offer/components/ListItems/OfferRecentViewListItem";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";

const RecentViewedOffers: React.FC = () => {

    const userCtx = useUserContext();
    const { t } = useTranslation();

    if (!userCtx.meCtx?.recentViewedOffers?.length) {
        return null;
    }

    return (<div className="pt-7">

        <div className="px-5 pb-2 secondary-text">{t("offer.recentlySeen")}:</div>

        {userCtx.meCtx.recentViewedOffers.map(item => {
            const offer = item.data as OfferI;
            return <div key={item.id} className="py-2">
                <OfferRecentViewListItem offer={offer} date={item.listedAt} disableDefaultBorder/>
            </div>
        })}

    </div>)
}

export default RecentViewedOffers;