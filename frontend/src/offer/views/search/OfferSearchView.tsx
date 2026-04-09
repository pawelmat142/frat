import React, { useEffect, useId } from "react";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useTranslation } from "react-i18next";
import { useOfferSearch } from "./OfferSearchProvider";
import Loading from "global/components/Loading";
import OfferSearchFilters from "./OfferSearchFilters";
import InfiniteScrollEventEmitter from "global/components/InfiniteScrollEventEmitter";
import OfferListItem from "offer/components/OfferListItem";
import FloatingActionButton from "global/components/buttons/FloatingActionButton";
import { Ico } from "global/icon.def";
import { AppConfig } from "@shared/AppConfig";

const OfferSearchView: React.FC = () => {

    const { t } = useTranslation();
    const globalCtx = useGlobalContext();
    const ctx = useOfferSearch();
    const fabId = useId();

    useEffect(() => {
        globalCtx.setFloatingButton(
            <FloatingActionButton
                forceVisible={!ctx.openPseudoView}
                onClick={() => ctx.setOpenPseudoView(true)}
                icon={<Ico.SLIDERS size={AppConfig.FAB_BTN_ICON_SIZE} />}
            />,
            fabId
        );
    }, [ctx.openPseudoView]);

    // Cleanup only on unmount — avoids null flash when openPseudoView changes
    useEffect(() => {
        return () => globalCtx.setFloatingButton(null);
    }, []);

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return <Loading></Loading>
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
                <div className="results flex flex-col">
                    {(ctx.results ?? []).map((offer, index) => (
                        <OfferListItem
                            key={offer.offerId}
                            offer={offer}
                            first={index === 0}
                            last={index === (ctx.results?.length ?? 0) - 1}
                        />
                    ))}
                    <InfiniteScrollEventEmitter emitEvent={ctx.loadMore} />
                </div>
            )}

            {ctx.loadingMore && ctx.results.length > 0 && (
                <div className="flex justify-center py-6">
                    <Loading></Loading>
                </div>
            )}

            {showEndOfResults && (
                <div className="flex justify-center py-4">
                    <span className="secondary-text s-font">{t('common.endOfResults', { defaultValue: 'No more offers to display.' })}</span>
                </div>
            )}

        </div>
    );

}

export default OfferSearchView;