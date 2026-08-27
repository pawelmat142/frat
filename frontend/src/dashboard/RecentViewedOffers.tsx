import { OfferI } from "@shared/interfaces/OfferI";
import OfferRecentViewListItem from "offer/components/ListItems/OfferRecentViewListItem";
import { useTranslation } from "react-i18next";
import { useUserContext } from "user/UserProvider";
import { useOfferSearch } from "offer/views/search/OfferSearchProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { getDashboardLimit } from "./dashboard.def";
import DesktopDashSection from "./DesktopDashSection";

const RecentViewedOffers: React.FC = () => {
    const userCtx = useUserContext();
    const { t } = useTranslation();
    const offerSearchCtx = useOfferSearch();
    const { isDesktop } = useGlobalContext();
    const items = (userCtx.meCtx?.recentViewedOffers ?? []).slice(0, getDashboardLimit(isDesktop));

    if (!items.length && !isDesktop) {
        return null;
    }

    return (
        <DesktopDashSection
            title={t("offer.recentlySeen")}
            empty={isDesktop && !items.length ? {
                text: "Nie oglądałeś jeszcze żadnych ofert.",
                actionTitle: "Szukaj ofert",
                onClick: offerSearchCtx.navToSearch,
            } : undefined}
        >
            {items.map(item => {
                const offer = item.data as OfferI;
                return (
                    <div key={item.id}>
                        <OfferRecentViewListItem offer={offer} date={item.listedAt} disableDefaultBorder />
                    </div>
                );
            })}
        </DesktopDashSection>
    );
};

export default RecentViewedOffers;