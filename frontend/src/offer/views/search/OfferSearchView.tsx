import React from "react";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useTranslation } from "react-i18next";
import { useOfferSearch } from "./OfferSearchProvider";
import Loading from "global/components/Loading";
import OfferSearchFilters from "./OfferSearchFilters";
import OfferTile from "offer/components/OfferTile";
import { useInfiniteScroll } from "shared/hooks/useInfiniteScroll";
import FloatingScrollButton from "global/components/buttons/FloatingScrollButton";

const OfferSearchView: React.FC = () => {

    const { t } = useTranslation();
    const globalCtx = useGlobalContext();
    const ctx = useOfferSearch();

    const sentinelRef = useInfiniteScroll({
        hasMore: ctx.hasMore,
        isLoading: ctx.loading || ctx.loadingMore,
        onLoadMore: ctx.loadMore,
    });

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return (
            <div>
                <Loading></Loading>

            </div>
        );
    }
    
    const initialLoading = ctx.loading && ctx.results.length === 0;
    const noResults = !initialLoading && ctx.results.length === 0;
    const showEndOfResults = !initialLoading && !ctx.loadingMore && !ctx.hasMore && ctx.results.length > 0;

    return (
        <div className="list-view pt-0">

            <div className="infinite-scroll-filters">
                <OfferSearchFilters />
            </div>

            {initialLoading ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <Loading></Loading>
                </div>
            ) : noResults ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <p className="xl-font mb-4 secondary-text">{t('common.noResults')}</p>
                </div>
            ) : (
                <div className="results flex flex-col gap-1">
                    {(ctx.results ?? []).map((offer, index) => (
                        <OfferTile
                            key={offer.offerId}
                            offer={offer}
                            first={index === 0}
                            last={index === (ctx.results?.length ?? 0) - 1}
                        />
                    ))}
                    <div ref={sentinelRef} className="h-1" aria-hidden="true"></div>
                </div>
            )}

            {ctx.loadingMore && ctx.results.length > 0 && (
                <div className="flex justify-center py-6">
                    <Loading></Loading>
                </div>
            )}

            {showEndOfResults && (
                <div className="flex justify-center py-4">
                    <span className="secondary-text small-font">{t('common.endOfResults', { defaultValue: 'No more offers to display.' })}</span>
                </div>
            )}



<FloatingScrollButton />
        </div>
    );

}

export default OfferSearchView;