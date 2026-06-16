import TileSection from "employee/components/TileSection";
import OfferRecentViewListItem from "offer/components/ListItems/OfferRecentViewListItem";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";

const LatestOffersDashboard: React.FC = () => {

    const userCtx = useUserContext();
    const { t } = useTranslation();

    const offers = userCtx.meCtx?.latestOffers?.sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }).slice(0, 3) ?? [];

    if (!offers?.length) {
        return null;
    }

    return <TileSection title={t("user.latestOffers")} >

        {offers.map(offer => {
            return <div key={offer.offerId}>
                <OfferRecentViewListItem offer={offer} date={offer.createdAt} disableDefaultBorder />
            </div>
        })}
    </TileSection>
}

export default LatestOffersDashboard;