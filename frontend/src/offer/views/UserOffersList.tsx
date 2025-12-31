import Button from "global/components/controls/Button";
import Loading from "global/components/Loading";
import OfferTile from "offer/components/OfferTile";
import { Path } from "../../path"
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { BtnSizes } from "global/interface/controls.interface";
import { useEffect, useState } from "react";
import { OfferI } from "@shared/interfaces/OfferI";
import { useAuthContext } from "auth/AuthProvider";
import { OffersService } from "offer/services/OffersService";

const UserOffersList: React.FC = () => {

    const params = useParams<{ uid?: string }>()
    const uid = params.uid || '';

    const [offers, setOffers] = useState<OfferI[]>([]);

    const profileCtx = useUserContext();
    const { me } = useAuthContext();

    const [loading, setLoading] = useState(true);

    const { t } = useTranslation();
    const navigate = useNavigate();
    const globalCtx = useGlobalContext();

    useEffect(() => {   
        const initOffers = async () => {
            if (uid) {
                if (me?.uid === uid) {
                    setOffers(profileCtx.offers);
                    return;
                }
                const userOffers = await OffersService.listUsersOffers(uid);
                setOffers(userOffers);
            }
        }
        initOffers().then(() => {setLoading(false);});
    }, [uid])
    
    const _loading = globalCtx.loading || profileCtx.loading || !globalCtx.dics.languages || loading;

    if (_loading) {
        return (<Loading></Loading>);
    }

    const isMyOffers = me?.uid === uid;

    const createBtn = !isMyOffers ? null : <div className="mt-auto flex flex-col mb-5 px-3">
        <Button fullWidth onClick={() => navigate(Path.OFFER_FORM)} size={BtnSizes.LARGE}>{t("offer.add")}</Button>
    </div>

    if (!offers?.length) {
        return (
            <div className="flex flex-col items-center justify-center mt-20">
                <p className="xl-font secondary-text mb-10">{t("offer.noOffers")}</p>

                {createBtn}
            </div>
        )
    }

    return (
        <div className="list-view flex-1 flex flex-col">

            <div className="results flex flex-col gap-1">
                {!!globalCtx.dics.languages && offers.map((offer, index) => (
                    <OfferTile
                        key={offer.offerId}
                        offer={offer}
                        first={index === 0}
                        last={index === offers.length - 1}
                    ></OfferTile>
                ))}
            </div>

            {createBtn}
                
        </div>
    )
}

export default UserOffersList;