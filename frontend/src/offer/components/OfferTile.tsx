import { OfferI } from "@shared/interfaces/OfferI";
import { useTranslation } from "react-i18next";
import { Path } from "../../path";
import { useNavigate } from "react-router-dom";
import Chips, { ChipModes } from "global/components/chips/Chips";
import { Util } from "@shared/utils/util";
import Flags from "global/Flags";

interface Props {
    offer: OfferI;
    first?: boolean;
    last?: boolean;
}

const OfferTile: React.FC<Props> = ({ offer, first, last }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const goToOfferView = (offer: OfferI) => {
        navigate(Path.getOfferPath(offer.offerId));
    };

    return (
        <div className={`tile ripple${first ? " first" : ""}${last ? " last" : ""}`} onClick={() => goToOfferView(offer)}>
            <div className="tile-avatar">
                {/* TODO: Offer avatar or icon */}
            </div>
            <div className="tile-content">
                <div className="tile-content-row top">
                    <div className="tile-content-title">{offer.displayName || t('offer.noTitle')}
                        <span>{offer.category}</span>
                    </div>
                    <div className="flex">
                        <Flags languages={[offer.locationCountry]} />
                    </div>
                </div>
                <div className="tile-content-row mid items-center justify-between w-full">
                    <div>{offer.displayAddress || offer.locationCountry}</div>
                    <span className="small-font text-right">{t('common.from')} {Util.displayDate(offer.startDate)}</span>
                </div>
                <div className="tile-content-row bottom">
                    <div className="flex">
                        <Chips chips={offer.skillsRequired || []} mode={ChipModes.TERTIARY}/>
                        <Chips className="ml-5" chips={offer.certificatesRequired || []} mode={ChipModes.SECONDARY} />
                    </div>
                    <div>{Util.displayDate(offer.createdAt)}</div>
                </div>
            </div>
        </div>
    );
};

export default OfferTile;
