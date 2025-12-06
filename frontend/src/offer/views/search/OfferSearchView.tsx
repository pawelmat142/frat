import { useGlobalContext } from "global/providers/GlobalProvider";
import { useTranslation } from "react-i18next";
import { useOfferSearch } from "./OfferSearchProvider";
import Loading from "global/components/Loading";
import OfferSearchFilters from "./OfferSearchFilters";
import OfferTile from "offer/components/OfferTile";
import Pagination from "global/components/controls/Pagination";

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
            <OfferSearchFilters />

                {!ctx.loading && !ctx.results?.length ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <p className="xl-font mb-4 secondary-text">{t('common.noResults')}</p>
                </div>
                ) : <div className="results flex flex-col gap-1">
                    {!!globalCtx.dics.languages && (ctx.results ?? []).map((offer, index) => (
                        <OfferTile
                            key={offer.offerId}
                            offer={offer}
                            first={index === 0}
                            last={index === (ctx.results?.length ?? 0) - 1}
                        />
                    ))}
                </div>}

            {ctx.loading ? (<div>
                <Loading></Loading>
            </div>) : (
                <Pagination
                    pagination={ctx.pagination}
                    onPrev={ctx.prevPage}
                    onNext={ctx.nextPage}
                />
            )}

        </div>
    )

}

export default OfferSearchView;