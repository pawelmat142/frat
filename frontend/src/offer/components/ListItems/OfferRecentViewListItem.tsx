import { OfferI } from "@shared/interfaces/OfferI"
import { useTranslation } from "react-i18next";
import OfferListItem from "./OfferListItem";
import DateDisplay from "global/components/ui/DateDisplay";

interface Props {
    offer: OfferI,
    first?: boolean,
    last?: boolean,
    disableDefaultBorder?: boolean
    date: Date
}

const OfferRecentViewListItem: React.FC<Props> = ({ offer, first, last, disableDefaultBorder, date }) => {

    const { t } = useTranslation();
    
    const rightSection = <div className="flex justify-end items-center gap-2">
        <div className="secondary-text s-font no-wrap pr-3">{DateDisplay({
            date,
            t,
        })} </div>
    </div>

    return <OfferListItem
        offer={offer}
        first={first}
        last={last}
        disableDefaultBorder={disableDefaultBorder}
        rightSection={rightSection}
    ></OfferListItem>

}

export default OfferRecentViewListItem;
