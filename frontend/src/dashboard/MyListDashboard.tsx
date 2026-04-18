import { UserListedItemReferenceTypes } from "@shared/interfaces/UserListedItem";
import { WorkerI } from "@shared/interfaces/WorkerI";
import WorkerRecentViewListItem from "employee/components/ListItems/WorkerRecentViewListItem";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import OfferRecentViewListItem from "offer/components/ListItems/OfferRecentViewListItem";
import { Path } from "../path";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useUserContext } from "user/UserProvider";
import ArrowIcon from "global/components/controls/ArrowIcon";
import { Ico } from "global/icon.def";

const MyListDashboard: React.FC = () => {

    const userCtx = useUserContext();
    const naviagate = useNavigate();
    const { t } = useTranslation();

    const items = (userCtx.meCtx?.listedItems || []).slice(0, 3);

    if (!items.length) {
        return null;
    }

    return (<div className="pt-7">

        <div className="flex items-center justify-between">
            <div className="px-5 pb-2 secondary-text">{t("user.myList")}:</div>

            <Button mode={BtnModes.PRIMARY_TXT} size={BtnSizes.SMALL} onClick={() => {
                naviagate(Path.MY_LIST);
            }}>{t("common.showMore")}
            <Ico.CHEVRON_RIGHT />
            </Button>
        </div>

        {items.map((item, index) => {

            if (item.referenceType === UserListedItemReferenceTypes.WORKER) {
                return (
                    <WorkerRecentViewListItem key={`w${item.data.workerId}`} className="primary-bg"
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

    </div>)
}

export default MyListDashboard;