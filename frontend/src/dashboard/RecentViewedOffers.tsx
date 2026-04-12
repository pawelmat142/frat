import { OfferI } from "@shared/interfaces/OfferI";
import OfferRecentViewListItem from "offer/components/ListItems/OfferRecentViewListItem";
import { useUserContext } from "user/UserProvider";

const RecentViewedOffers: React.FC = () => {

    const userCtx = useUserContext();

    if (!userCtx.meCtx?.recentViewedOffers?.length) {
        return null;
    }

    // TODO translate
    return (<div className="pt-10">

        <div className="px-5 pb-3 secondary-text">Ostatnio przeglądane oferty:</div>

        {userCtx.meCtx.recentViewedOffers.map(item => {
            const offer = item.data as OfferI;
            return <div key={item.id} className="py-2">
                <OfferRecentViewListItem offer={offer} date={item.listedAt} disableDefaultBorder/>
            </div>
        })}

    </div>)
}

export default RecentViewedOffers;