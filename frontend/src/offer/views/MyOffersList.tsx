import Button from "global/components/controls/Button";
import Loading from "global/components/Loading";
import OfferTile from "offer/components/OfferTile";
import { Path } from "../../path"
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { BtnSizes } from "global/interface/controls.interface";

const MyOffersList: React.FC = () => {

    const profileCtx = useUserContext();

    const { t } = useTranslation();
    const navigate = useNavigate();
    const globalCtx = useGlobalContext();

    if (globalCtx.loading || profileCtx.loading || !globalCtx.dics.languages) {
        return (<Loading></Loading>);
    }

    const offers = profileCtx.offers;

    const createBtn = <div className="mt-auto flex flex-col mb-5 px-3">
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

export default MyOffersList;