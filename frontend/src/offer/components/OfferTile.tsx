import { OfferI } from "@shared/interfaces/OfferI";
import { useTranslation } from "react-i18next";
import { Path } from "../../path";
import { useNavigate } from "react-router-dom";
import Chips from "global/components/chips/Chips";
import { Util } from "@shared/utils/util";

interface Props {
    offer: OfferI;
    first?: boolean;
    last?: boolean;
}

// TODO offer view
// TODO offer form - edit mode
// TODO offer search view
// TODO offer tile improve
// TODO offers view admin app

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
                        {/* TODO: Add country flag/icon for offer.locationCountry if available */}
                    </div>
                </div>
                <div className="tile-content-row mid items-center justify-between w-full">
                    <div>{offer.displayAddress || offer.locationCountry}</div>
                    <span className="small-font text-right">{t('common.from')} {Util.displayDate(offer.startDate)}</span>
                </div>
                <div className="tile-content-row bottom">
                    <div className="flex">
                        <Chips chips={offer.skillsRequired || []} />
                        <Chips className="ml-10" chips={offer.certificatesRequired || []} />
                    </div>
                    <div>{Util.displayDate(offer.createdAt)}</div>
                </div>
            </div>
        </div>
    );
};

export default OfferTile;
