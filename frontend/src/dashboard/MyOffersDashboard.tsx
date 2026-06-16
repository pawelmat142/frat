import TileSection from "employee/components/TileSection";
import OfferRecentViewListItem from "offer/components/ListItems/OfferRecentViewListItem";
import { Path } from "../path";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";

const MyOffersDashboard: React.FC = () => {

    const userCtx = useUserContext();
    const { t } = useTranslation();
    const naviagate = useNavigate();

    const offers = userCtx.meCtx?.offers?.sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }).slice(0, 3) ?? [];

    if (!offers?.length) {
        return null;
    }

    const uid = userCtx?.me?.uid;
    if (!uid) {
        return "Something went wrong, user not found";
    }

    return <TileSection title={t("user.myOffers")} link={{ onClick: () => naviagate(Path.getOffersPath(uid)) }} >

        {offers.map(offer => {
            return <div key={offer.offerId} className="py-2">
                <OfferRecentViewListItem offer={offer} date={offer.createdAt} disableDefaultBorder />
            </div>
        })}
    </TileSection>
}

export default MyOffersDashboard;