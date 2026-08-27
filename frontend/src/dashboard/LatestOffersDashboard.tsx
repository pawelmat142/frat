import OfferRecentViewListItem from "offer/components/ListItems/OfferRecentViewListItem";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import { useOfferSearch } from "offer/views/search/OfferSearchProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { getDashboardLimit } from "./dashboard.def";
import DesktopDashSection from "./DesktopDashSection";

const LatestOffersDashboard: React.FC = () => {
    const userCtx = useUserContext();
    const { t } = useTranslation();
    const offerSearchCtx = useOfferSearch();
    const { isDesktop } = useGlobalContext();
    const offers = userCtx.meCtx?.latestOffers?.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }).slice(0, getDashboardLimit(isDesktop)) ?? [];

    if (!offers.length && !isDesktop) {
        return null;
    }

    return (
        <DesktopDashSection
            title={t("user.latestOffers")}
            empty={isDesktop && !offers.length ? {
                text: "Brak najnowszych ofert.",
                actionTitle: "Szukaj ofert",
                onClick: offerSearchCtx.navToSearch,
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

export default LatestOffersDashboard;