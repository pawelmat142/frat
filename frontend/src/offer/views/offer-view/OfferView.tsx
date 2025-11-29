import { OfferI } from "@shared/interfaces/OfferI";
import { Util } from "@shared/utils/util";
import { useAuthContext } from "auth/AuthProvider";
import CallendarTile from "employee/views/profile/CallendarTile";
import EditButton from "global/components/buttons/EditButton";
import Chips from "global/components/chips/Chips";
import Loading from "global/components/Loading";
import Flags from "global/Flags";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { Utils } from "global/utils";
import { OffersService } from "offer/services/OffersService";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import OfferDetailsTile from "./OfferDetailsTile";

const OfferView: React.FC = () => {

    const params = useParams<{ offerId?: string }>()
    const offerId = params.offerId

    const { me } = useAuthContext();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const globalCtx = useGlobalContext();
    
    const [offer, setOffer] = useState<OfferI | null>(null);
    const [loading, setLoading] = useState(false);

    // TODO trigger views count
    // TODO add like button/functionality

    // TODO global context - menu - delete, edit, share
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

    if (loading || globalCtx.loading || !globalCtx.dics.languages) {
        return <Loading />
    }
    if (!offer) {
        return <div>{t("common.noResults")}</div>
    }

    const goToEditForm = () => {
        // TODO 
    }

    const isMyOffer = me?.uid === offer.uid;

    console.log("OfferView render", offer);
    return (
        <div className="view-container">

            <div>
                <div className="main-tiles">

                    <OfferDetailsTile offer={offer} />

                    <CallendarTile range={{ start: offer.startDate, end: offer.endDate }}></CallendarTile>

                    <div className="square-tile col-tile"></div>

                </div>

                {!!offer.skillsRequired?.length && (<>
                    <div className="mt-5 mb-1 secondary-text">{t('offer.skillsRequired')}: </div>
                    <Chips chips={offer.skillsRequired || []}></Chips>
                </>)}
                {!!offer.skillsNiceToHave?.length && (<>
                    <div className="mt-3 mb-1 secondary-text">{t('offer.skillsNiceToHave')}: </div>
                    <Chips chips={offer.skillsNiceToHave || []}></Chips>
                </>)}

                {!!offer.certificatesRequired?.length && (<>
                    <div className="mt-5 mb-1 secondary-text">{t('offer.certificatesRequired')}: </div>
                    <Chips chips={offer.certificatesRequired || []}></Chips>
                </>)}
                {!!offer.certificatesNiceToHave?.length && (<>
                    <div className="mt-3 mb-1 secondary-text">{t('offer.certificatesNiceToHave')}: </div>
                    <Chips chips={offer.certificatesNiceToHave || []}></Chips>
                </>)}

                {!!offer.languagesRequired?.length && (<div>
                    <div className="mt-5 mb-1 secondary-text">{t('offer.languagesRequired')}: </div>
                    <Flags languages={offer.languagesRequired!} />
                    <div className="mt-1 xs-font secondary-text">{Utils.prepareLanguageNames(t, offer.languagesRequired!, globalCtx.dics.languages!)}</div>
                </div>)}
                {!!offer.languagesNiceToHave?.length && (<div>
                    <div className="mt-3 mb-1 secondary-text">{t('offer.languagesNiceToHave')}: </div>
                    <Flags languages={offer.languagesNiceToHave!} />
                    <div className="mt-1 xs-font secondary-text">{Utils.prepareLanguageNames(t, offer.languagesNiceToHave!, globalCtx.dics.languages!)}</div>
                </div>)}

                {isMyOffer && (
                    <div className="mt-10 mb-10">
                        <EditButton onClick={goToEditForm} label={t('offer.editButton')}></EditButton>
                    </div>
                )}


            </div>
        </div>

    )
}

export default OfferView;