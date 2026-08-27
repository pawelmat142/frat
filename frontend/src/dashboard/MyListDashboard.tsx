import { UserListedItemReferenceTypes } from "@shared/interfaces/UserListedItem";
import { WorkerI } from "@shared/interfaces/WorkerI";
import WorkerRecentViewListItem from "employee/components/ListItems/WorkerRecentViewListItem";
import OfferRecentViewListItem from "offer/components/ListItems/OfferRecentViewListItem";
import { Path } from "../path";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useUserContext } from "user/UserProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { getDashboardLimit } from "./dashboard.def";
import DesktopDashSection from "./DesktopDashSection";

const MyListDashboard: React.FC = () => {
    const userCtx = useUserContext();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { isDesktop } = useGlobalContext();
    const items = (userCtx.meCtx?.listedItems || []).slice(0, getDashboardLimit(isDesktop));

    if (!items.length) {
        return null;
    }

    return (
        <DesktopDashSection
            title={t("user.myList")}
            link={{ onClick: () => navigate(Path.MY_LIST) }}
        >
            {items.map((item, index) => {
                if (item.referenceType === UserListedItemReferenceTypes.WORKER) {
                    return (
                        <WorkerRecentViewListItem
                            key={`w${item.data.workerId}`}
                            worker={item.data as WorkerI}
                            disableDefaultBorder
                        />
                    );
                }

                if (item.referenceType === UserListedItemReferenceTypes.OFFER) {
                    return (
                        <OfferRecentViewListItem
                            key={`o${item.data.offerId}`}
                            offer={item.data}
                            first={index === 0}
                            last={index === items.length - 1}
                            disableDefaultBorder
                        />
                    );
                }

                return null;
            })}
        </DesktopDashSection>
    );
};

export default MyListDashboard;