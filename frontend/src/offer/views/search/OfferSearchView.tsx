import React, { useEffect, useRef } from "react";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useTranslation } from "react-i18next";
import { useOfferSearch } from "./OfferSearchProvider";
import Loading from "global/components/Loading";
import OfferSearchFilters from "./OfferSearchFilters";
import OfferTile from "offer/components/OfferTile";

const OfferSearchView: React.FC = () => {

    const { t } = useTranslation();
    const globalCtx = useGlobalContext();
    const ctx = useOfferSearch();

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    const hasMoreRef = useRef(ctx.hasMore);
    const loadingRef = useRef(ctx.loading || ctx.loadingMore);

    useEffect(() => {
        hasMoreRef.current = ctx.hasMore;
    }, [ctx.hasMore]);

    useEffect(() => {
        loadingRef.current = ctx.loading || ctx.loadingMore;
    }, [ctx.loading, ctx.loadingMore]);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) {
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            const entry = entries[0];
            if (entry && entry.isIntersecting && hasMoreRef.current && !loadingRef.current) {
                loadingRef.current = true;
                ctx.loadMore();
            }
        }, {
            root: null,
            rootMargin: "200px 0px",
            threshold: 0,
        });

        observer.observe(sentinel);

        return () => {
            observer.disconnect();
        };
    }, [ctx.loadMore]);

    if (globalCtx.loading || !globalCtx.dics.languages) {
        return (
            <div>
                <Loading></Loading>
            </div>
        );
    }

    const initialLoading = ctx.loading && ctx.results.length === 0;
    const noResults = !initialLoading && ctx.results.length === 0;

    return (
        <div className="list-view">
            <OfferSearchFilters />

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

        </div>
    );

}

export default OfferSearchView;