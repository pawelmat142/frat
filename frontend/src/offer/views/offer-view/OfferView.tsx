import { OfferI } from "@shared/interfaces/OfferI";
import { useAuthContext } from "auth/AuthProvider";
import CallendarTile from "employee/views/profile/CallendarTile";
import Loading from "global/components/Loading";
import { OffersService } from "offer/services/OffersService";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useUserContext } from "user/UserProvider";

const OfferView: React.FC = () => {

    const params = useParams<{ offerId?: string }>()
    const offerId = params.offerId

    const { me } = useAuthContext();
    const { t } = useTranslation();
    const userCtx = useUserContext();

    const [offer, setOffer] = useState<OfferI | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const initOffer = async () => {
            const oid = Number(offerId);
            if (oid) {
                const o = userCtx.offers?.find(o => o.offerId === oid);
                if (o) {
                    setOffer(o);
                    return;
                }
                // TODO select from searched offers if any
                try {
                    setLoading(true);
                    const result = await OffersService.getOfferById(oid);
                    setOffer(result);
                }
                finally {
                    setLoading(false);
                }
            }
        }
        initOffer()
    }, [])

    if (loading) {
        return <Loading />
    }
    if (!offer) {
        return <div>{t("common.noResults")}</div>
    }

    return (
        <div className="view-container">

            <div>
                <div className="main-tiles">

                    <CallendarTile range={{start: offer.startDate, end: offer.endDate }}></CallendarTile>

                    <div className="square-tile col-tile"></div>
                    <div className="square-tile col-tile"></div>
                    <div className="square-tile col-tile"></div>
                </div>
            </div>
        </div>

    )
}

export default OfferView;