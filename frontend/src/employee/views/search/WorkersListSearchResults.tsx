import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import Loading from "global/components/Loading";
import InfiniteScrollEventEmitter from "global/components/InfiniteScrollEventEmitter";
import SwipeableRow, { SwipeableRowRef } from "global/components/SwipeableRow";
import IconButton from "global/components/controls/IconButon";
import WorkerSearchListItem from "employee/components/ListItems/WorkerSearchListItem";
import { Ico } from "global/icon.def";
import { BtnModes } from "global/interface/controls.interface";
import { useWorkersSearch } from "./WorkersSearchProvider";
import { useUserContext } from "user/UserProvider";
import { UserListedItemService } from "user/services/UserListedItemService";
import { UserListedItemReferenceTypes, UserListedItemTypes } from "@shared/interfaces/UserListedItem";
import { WorkerI } from "@shared/interfaces/WorkerI";
import { toast } from "react-toastify";

const WorkersListSearchResults: React.FC = () => {
    const ctx = useWorkersSearch();
    const userCtx = useUserContext();
    const { t } = useTranslation();

    const swipeRefs = useRef<Map<number, SwipeableRowRef>>(new Map());
    const [loading, setLoading] = React.useState(false);

    const showEndOfResults = !ctx.loadingMore && !ctx.hasMore && ctx.results.length > 0;

    const addItemToMyList = async (worker: WorkerI) => {
        const meCtx = userCtx.meCtx;
        if (worker.uid === userCtx.me?.uid || !meCtx) return;
        try {
            setLoading(true);
            const item = await UserListedItemService.addItem({
                reference: worker.workerId.toString(),
                referenceType: UserListedItemReferenceTypes.WORKER,
                listedType: UserListedItemTypes.DEFAULT,
            });
            if (!item) {
                toast.error(t('user.addToListError'));
                return;
            }
            userCtx.updateMeCtx({ ...meCtx, listedItems: [...(meCtx.listedItems ?? []), item] });
            toast.success(t('user.addToListSuccess'));
        } finally {
            setLoading(false);
        }
    };

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
                listedItems: (meCtx.listedItems ?? []).filter(item => item.id !== listItem.id),
            } as Parameters<typeof userCtx.updateMeCtx>[0]);
            toast.success(t('user.removeFromListSuccess'));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center mt-20">
                <Loading />
            </div>
        );
    }

    return (
        <>
            <div className="results flex flex-col">
                {ctx.results.map((worker, index) => {
                    const isSavedOnList = (userCtx.meCtx?.listedItems ?? [])
                        .some(item => item.reference === worker?.workerId?.toString() && item.referenceType === UserListedItemReferenceTypes.WORKER);

                    const rowActions = (
                        <>
                            {isSavedOnList ? (
                                <IconButton className="p-3" mode={BtnModes.ERROR_TXT} icon={<Ico.STAR_OUTLINE />} onClick={() => removeListItem(worker)} />
                            ) : (
                                <IconButton className="p-3" icon={<Ico.STAR />} onClick={() => addItemToMyList(worker)} />
                            )}
                        </>
                    );

                    return (
                        <SwipeableRow
                            key={worker.workerId}
                            disable={worker.uid === userCtx.me?.uid}
                            ref={el => el ? swipeRefs.current.set(worker.workerId, el) : swipeRefs.current.delete(worker.workerId)}
                            actions={rowActions}
                        >
                            <WorkerSearchListItem
                                className="primary-bg"
                                worker={worker}
                                first={index === 0}
                                last={index === (ctx.results?.length ?? 0) - 1}
                            />
                        </SwipeableRow>
                    );
                })}
                <InfiniteScrollEventEmitter emitEvent={ctx.loadMore} />
            </div>

            {ctx.loadingMore && ctx.results.length > 0 && (
                <div className="flex justify-center py-6">
                    <Loading />
                </div>
            )}

            {showEndOfResults && (
                <div className="flex justify-center py-4">
                    <span className="secondary-text s-font">{t('common.endOfResults', { defaultValue: 'No more profiles to display.' })}</span>
                </div>
            )}
        </>
    );
};

export default WorkersListSearchResults;
