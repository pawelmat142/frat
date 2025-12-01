import { useGlobalContext } from "global/providers/GlobalProvider";
import { useTranslation } from "react-i18next";
import { useOfferSearch } from "./OfferSearchProvider";
import Loading from "global/components/Loading";
import OfferSearchFilters from "./OfferSearchFilters";
import OfferTile from "offer/components/OfferTile";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";

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

            {/* TODO translations */}
            {ctx.loading ? (<div>
                <Loading></Loading>
            </div>) : (
                <div className="flex-[2] flex justify-center items-center gap-4 mt-5 mb-10">
                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        onClick={() => ctx.prevPage()}
                        disabled={ctx.pagination.currentPage === 1}
                    >
                        Previous
                    </Button>
                    <span className="secondary-text whitespace-nowrap">
                        Page {ctx.pagination.currentPage} of {ctx.pagination.totalPages} ({ctx.pagination.count} items)
                    </span>
                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        onClick={() => ctx.nextPage()}
                        disabled={ctx.pagination.currentPage === ctx.pagination.totalPages}
                    >
                        Next
                    </Button>
                </div>
            )}

        </div>
    )

}

export default OfferSearchView;