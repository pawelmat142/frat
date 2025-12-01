import { useGlobalContext } from "global/providers/GlobalProvider";
import { useTranslation } from "react-i18next";
import { useOfferSearch } from "./OfferSearchProvider";
import Loading from "global/components/Loading";

const OfferSearchView: React.FC = () => {

    const { t } = useTranslation();
    const globalCtx = useGlobalContext();
    const ctx = useOfferSearch();

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return (<div>
            <Loading></Loading>
        </div>)
    }

    return (
        <div className="list-view">
        </div>
    )

}

export default OfferSearchView;