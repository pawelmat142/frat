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

    // TODO translations
    if (!offers?.length) {

        // TODO replace header with header title
        return (
            <div className="flex flex-col items-center justify-center mt-20">
                <p className="xl-font mb-4 secondary-text">You have no offers yet.</p>
            </div>
        )
    }

    return (
        <div className="list-view flex-1 flex flex-col">

            <h2 className="form-header">
                {t("offer.myList.title")}
            </h2>

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

            <div className="mt-auto flex flex-col mb-5 px-3">
                {/* TODO translation */}
                <Button fullWidth onClick={() => navigate(Path.OFFER_FORM)} size={BtnSizes.LARGE}>Add Offer</Button>

            </div>


        </div>
    )
}

export default MyOffersList;