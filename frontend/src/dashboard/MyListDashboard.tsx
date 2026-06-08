import { UserListedItemReferenceTypes } from "@shared/interfaces/UserListedItem";
import { WorkerI } from "@shared/interfaces/WorkerI";
import WorkerRecentViewListItem from "employee/components/ListItems/WorkerRecentViewListItem";
import OfferRecentViewListItem from "offer/components/ListItems/OfferRecentViewListItem";
import { Path } from "../path";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useUserContext } from "user/UserProvider";
import TileSection from "employee/components/TileSection";

const MyListDashboard: React.FC = () => {

    const userCtx = useUserContext();
    const naviagate = useNavigate();
    const { t } = useTranslation();

    const items = (userCtx.meCtx?.listedItems || []).slice(0, 3);

    if (!items.length) {
        return null;
    }

    return <TileSection title={t("user.myList")} link={{ onClick: () => naviagate(Path.MY_LIST) }}>
        {items.map((item, index) => {

            if (item.referenceType === UserListedItemReferenceTypes.WORKER) {
                return (
                    <WorkerRecentViewListItem key={`w${item.data.workerId}`}
                        worker={item.data as WorkerI}
                        disableDefaultBorder
                        date={item.listedAt}
                    ></WorkerRecentViewListItem>

                )
            }

            if (item.referenceType === UserListedItemReferenceTypes.OFFER) {
                return (
                    <OfferRecentViewListItem key={`o${item.data.offerId}`}
                        offer={item.data}
                        first={index === 0}
                        last={index === (items?.length ?? 0) - 1}
                        disableDefaultBorder
                        date={item.listedAt}
                    ></OfferRecentViewListItem>

                )
            }

            return null

        })}
    </TileSection>
}

export default MyListDashboard;