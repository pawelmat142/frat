import { OfferI } from "@shared/interfaces/OfferI"
import { Path } from "../../../path";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ListItem from "global/components/ListItem";
import OfferAvatarMock from "../OfferAvatarMock";
import OfferStatItems from "../OfferStatItems";

interface Props {
    offer: OfferI,
    first?: boolean,
    last?: boolean,
    disableDefaultBorder?: boolean
    rightSection?: React.ReactNode,
    className?: string
}

const OfferListItem: React.FC<Props> = ({ offer, first, last, disableDefaultBorder, rightSection, className }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();

    const goToOfferView = () => {
        navigate(Path.getOfferPathOld(offer.offerId));
    }

    const topLeft = (
        <div className="flex items-center gap-2">
            <div className="font-medium truncate">
                {offer.displayName || t('offer.untitled')}
            </div>
        </div>
    );

    const avatarMock = offer.avatarRef ? undefined : <OfferAvatarMock
        offer={offer}
    />

    return (
        <div onClick={goToOfferView} className={className}>
            <ListItem
                imgUrl={offer.avatarRef ? offer.avatarRef.url : undefined}
                imgComponent={avatarMock}
                topLeft={topLeft}
                bottomLeft={<OfferStatItems offer={offer} showStartsFrom />}
                first={first}
                last={last}
                rightSection={rightSection}
                disableDefaultBorder={disableDefaultBorder}
            />
        </div>
    )

}

export default OfferListItem;
