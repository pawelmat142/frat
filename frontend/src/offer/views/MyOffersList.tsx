import { DictionaryI } from "@shared/interfaces/DictionaryI";
import Button from "global/components/controls/Button";
import Loading from "global/components/Loading";
import { DictionaryService } from "global/services/DictionaryService";
import OfferTile from "offer/components/OfferTile";
import { Path } from "../../path"
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";

const MyOffersList: React.FC = () => {

    const profileCtx = useUserContext();

    const [languagesDictionary, setLanguagesDictionary] = useState<DictionaryI | null>(null);
    const { t } = useTranslation();
    const navigate = useNavigate();


    useEffect(() => {
        const initDictionary = async () => {
            profileCtx.setLoading(true);
            const dictionary = await DictionaryService.getDictionary('LANGUAGES');
            setLanguagesDictionary(dictionary);
            profileCtx.setLoading(false);
        }
        initDictionary();
    }, []);


    if (profileCtx.loading) {
        return (<Loading></Loading>);
    }

    const offers = profileCtx.offers;

    // TODO translations
    if (!offers?.length) {
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
                {languagesDictionary && offers.map((offer, index) => (
                    <OfferTile
                        key={offer.offerId}
                        offer={offer}
                        first={index === 0}
                        last={index === offers.length - 1}
                    ></OfferTile>
                ))}
            </div>

            <div className="mt-auto flex flex-col mb-5">
                <Button fullWidth onClick={() => navigate(Path.OFFER_FORM)}>Add Offer</Button>

            </div>


        </div>
    )
}

export default MyOffersList;