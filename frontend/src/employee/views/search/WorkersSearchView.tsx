import React, { useEffect, useId, useRef } from "react";
import { useTranslation } from "react-i18next";
import Loading from "global/components/Loading";
import { useWorkersSearch } from "./WorkersSearchProvider";
import WorkersSearchFilters from "./WorkersSearchFilters";
import { useGlobalContext } from "global/providers/GlobalProvider";
import InfiniteScrollEventEmitter from "global/components/InfiniteScrollEventEmitter";
import { FaRegBookmark, FaUserSlash } from "react-icons/fa";
import FloatingActionButton from "global/components/buttons/FloatingActionButton";
import { Ico } from "global/icon.def";
import { AppConfig } from "@shared/AppConfig";
import WorkerSearchListItem from "employee/components/ListItems/WorkerSearchListItem";
import Header from "global/components/Header";
import SwipeableRow, { SwipeableRowRef } from "global/components/SwipeableRow";
import IconButton from "global/components/controls/IconButon";
import { UserListedItemService } from "user/services/UserListedItemService";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { UserListedItemReferenceTypes, UserListedItemTypes } from "@shared/interfaces/UserListedItem";
import { useUserContext } from "user/UserProvider";
import { toast } from "react-toastify";
import { BtnModes } from "global/interface/controls.interface";

const WorkersSearchView: React.FC = () => {

    const ctx = useWorkersSearch()
    const userCtx = useUserContext();
    const { t } = useTranslation()
    const globalCtx = useGlobalContext()
    const fabId = useId()

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

    const initialLoading = ctx.loading && ctx.results.length === 0;
    const noResults = !initialLoading && ctx.results.length === 0;
    const showEndOfResults = !initialLoading && !ctx.loadingMore && !ctx.hasMore && ctx.results.length > 0;

    const addItemToMyList = async (worker: WorkerI) => {
        const meCtx = userCtx.meCtx;
        if (worker.uid === userCtx.me?.uid || !meCtx) return;
        try {
            setLoading(true);
            const item = await UserListedItemService.addItem({
                reference: worker.workerId.toString(),
                referenceType: UserListedItemReferenceTypes.WORKER,
                listedType: UserListedItemTypes.DEFAULT
            });
            if (!item) {
                toast.error("Nie można dodać tego wpisu do listy");
                return;
            }
            userCtx.updateMeCtx({
                ...meCtx,
                listedItems: [...(meCtx.listedItems ?? []), item]
            });
            toast.success("Dodano wpis do Twojej listy");
        } finally {
            setLoading(false);
        }
    }

    const removeListItem = async (worker: WorkerI) => {
        if (worker.uid === userCtx.me?.uid || !userCtx.meCtx) return;
        const listItem = (userCtx.meCtx.listedItems ?? [])
            .find(item => item.reference === worker.workerId.toString() && item.referenceType === UserListedItemReferenceTypes.WORKER);
        if (!listItem) return;
        const meCtx = userCtx.meCtx;
        try {
            setLoading(true);
            await UserListedItemService.removeItem(listItem.id.toString());
            userCtx.updateMeCtx({
                ...meCtx,
                listedItems: (meCtx.listedItems ?? []).filter(item => item.id !== listItem.id)
            } as Parameters<typeof userCtx.updateMeCtx>[0]);
            toast.success("Usunięto wpis z Twojej listy");
        }
        finally {
            setLoading(false);
        }
    }

    return (<>
        <Header title={t('employeeProfile.title')}></Header>

        <div className="list-view pt-0">

            <div className="infinite-scroll-filters">
                <WorkersSearchFilters />
            </div>

            {initialLoading || loading ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <Loading></Loading>
                </div>
            ) : noResults ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <FaUserSlash className="mx-auto text-4xl mb-2 opacity-50" />
                    <p className="xl-font mb-4 secondary-text">{t('common.noResults')}</p>
                </div>
            ) : (
                <div className="results flex flex-col">
                    {(ctx.results).map((worker, index) => {

                        const isSavedOnList = (userCtx.meCtx?.listedItems ?? [])
                                .some(item => item.reference === worker?.workerId?.toString() && item.referenceType === UserListedItemReferenceTypes.WORKER);

                        const rowActions = <>
                            {isSavedOnList ? (
                                <IconButton className="p-3" mode={BtnModes.ERROR_TXT} icon={<FaRegBookmark />} onClick={() => { removeListItem(worker) }}></IconButton>
                            ) : (
                                <IconButton className="p-3"  icon={<Ico.BOOKMARK />} onClick={() => { addItemToMyList(worker) }}></IconButton>
                            )}
                        </>

                        return (
                            <SwipeableRow disable={worker.uid === userCtx.me?.uid}
                            key={worker.workerId} 
                            ref={el => el ? swipeRefs.current.set(worker.workerId, el) : swipeRefs.current.delete(worker.workerId)} actions={rowActions}>
                                <WorkerSearchListItem className="primary-bg"
                                    worker={worker}
                                    first={index === 0}
                                    last={index === (ctx.results?.length ?? 0) - 1}
                                ></WorkerSearchListItem>
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
                    <span className="secondary-text s-font">{t('common.endOfResults', { defaultValue: 'No more profiles to display.' })}</span>
                </div>
            )}

        </div>
    </>

    )
}


export default WorkersSearchView;