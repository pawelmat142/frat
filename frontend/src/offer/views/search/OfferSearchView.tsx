import React, { useEffect, useId, useRef } from "react";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useTranslation } from "react-i18next";
import { useOfferSearch } from "./OfferSearchProvider";
import Loading from "global/components/Loading";
import OfferSearchFilters from "./OfferSearchFilters";
import InfiniteScrollEventEmitter from "global/components/InfiniteScrollEventEmitter";
import OfferSearchListItem from "offer/components/ListItems/OfferSearchListItem";
import FloatingActionButton from "global/components/buttons/FloatingActionButton";
import { Ico } from "global/icon.def";
import { AppConfig } from "@shared/AppConfig";
import Header from "global/components/Header";
import SwipeableRow, { SwipeableRowRef } from "global/components/SwipeableRow";
import { useUserContext } from "user/UserProvider";
import { OfferI } from "@shared/interfaces/OfferI";
import { UserListedItemReferenceTypes, UserListedItemTypes } from "@shared/interfaces/UserListedItem";
import { UserListedItemService } from "user/services/UserListedItemService";
import { toast } from "react-toastify";
import IconButton from "global/components/controls/IconButon";
import { BtnModes } from "global/interface/controls.interface";

const OfferSearchView: React.FC = () => {

    const { t } = useTranslation();
    const globalCtx = useGlobalContext();
    const ctx = useOfferSearch();
    const userCtx = useUserContext();
    const fabId = useId();

    const swipeRefs = useRef<Map<number, SwipeableRowRef>>(new Map());
    const [loading, setLoading] = React.useState(false);

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

    const addItemToMyList = async (offer: OfferI) => {
        const meCtx = userCtx.meCtx;
        if (offer.uid === userCtx.me?.uid || !meCtx) return;
        try {
            setLoading(true);
            const item = await UserListedItemService.addItem({
                reference: offer.offerId.toString(),
                referenceType: UserListedItemReferenceTypes.OFFER,
                listedType: UserListedItemTypes.DEFAULT
            });
            if (!item) {
                toast.error(t('user.addToListError'));
                return;
            }
            userCtx.updateMeCtx({
                ...meCtx,
                listedItems: [...(meCtx.listedItems ?? []), item]
            });
            toast.success(t('user.addToListSuccess'));
        } finally {
            setLoading(false);
        }
    }

    const removeListItem = async (offer: OfferI) => {
        if (offer.uid === userCtx.me?.uid || !userCtx.meCtx) return;
        const listItem = (userCtx.meCtx.listedItems ?? [])
            .find(item => item.reference === offer.offerId.toString() && item.referenceType === UserListedItemReferenceTypes.OFFER);
        if (!listItem) return;
        const meCtx = userCtx.meCtx;
        try {
            setLoading(true);
            await UserListedItemService.removeItem(listItem.id.toString());
            userCtx.updateMeCtx({
                ...meCtx,
                listedItems: (meCtx.listedItems ?? []).filter(item => item.id !== listItem.id)
            } as Parameters<typeof userCtx.updateMeCtx>[0]);
            toast.success(t('user.removeFromListSuccess'));
        }
        finally {
            setLoading(false);
        }
    }

    const initialLoading = ctx.loading && ctx.results.length === 0;
    const noResults = !initialLoading && ctx.results.length === 0;
    const showEndOfResults = !initialLoading && !ctx.loadingMore && !ctx.hasMore && ctx.results.length > 0;

    return (
        <>
            <Header title={t('offer.searchTitle')} />

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
                        {(ctx.results ?? []).map((offer, index) => {

                            const isSavedOnList = (userCtx.meCtx?.listedItems ?? [])
                                .some(item => item.reference === offer?.offerId?.toString() && item.referenceType === UserListedItemReferenceTypes.WORKER);

                            const rowActions = <>
                                {isSavedOnList ? (
                                    <IconButton className="p-3" mode={BtnModes.ERROR_TXT} icon={<Ico.STAR_OUTLINE />} onClick={() => { removeListItem(offer) }}></IconButton>
                                ) : (
                                    <IconButton className="p-3" icon={<Ico.STAR />} onClick={() => { addItemToMyList(offer) }}></IconButton>
                                )}
                            </>
                            
                            return (
                                <SwipeableRow disable={offer.uid === userCtx.me?.uid}
                                    key={offer.offerId}
                                    ref={el => el ? swipeRefs.current.set(offer.offerId, el) : swipeRefs.current.delete(offer.offerId)} actions={rowActions}>
                                    <OfferSearchListItem className="primary-bg"
                                        key={offer.offerId}
                                        offer={offer}
                                        first={index === 0}
                                        last={index === (ctx.results?.length ?? 0) - 1}
                                    />
                                </SwipeableRow>
                            )
                        })}
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
        </>
    );

}

export default OfferSearchView;