import OfferRecentViewListItem from "offer/components/ListItems/OfferRecentViewListItem";
import { Path } from "../path";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { getDashboardLimit } from "./dashboard.def";
import DesktopDashSection from "./DesktopDashSection";

const MyOffersDashboard: React.FC = () => {
    const userCtx = useUserContext();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { isDesktop } = useGlobalContext();
    const offers = userCtx.meCtx?.offers?.sort((a, b) => {
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    }).slice(0, getDashboardLimit(isDesktop)) ?? [];

    const uid = userCtx?.me?.uid;
    if (!uid) {
        return "Something went wrong, user not found";
    }

    if (!offers.length && !isDesktop) {
        return null;
    }

    return (
        <DesktopDashSection
            title={t("user.myOffers")}
            link={offers.length ? { onClick: () => navigate(Path.getOffersPath(uid)) } : undefined}
            empty={isDesktop && !offers.length ? {
                text: "Nie masz jeszcze ofert.",
                actionTitle: "Dodaj ofertę",
                onClick: () => navigate(Path.OFFER_FORM),
            } : undefined}
        >
            {offers.map(offer => (
                <div key={offer.offerId}>
                    <OfferRecentViewListItem offer={offer} disableDefaultBorder />
                </div>
            ))}
        </DesktopDashSection>
    );
};

export default MyOffersDashboard;