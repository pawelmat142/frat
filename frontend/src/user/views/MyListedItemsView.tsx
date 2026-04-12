import React, { useRef, useState } from "react";
import { UserListedItem, UserListedItemReferenceTypes } from "@shared/interfaces/UserListedItem";
import { WorkerI } from "@shared/interfaces/WorkerI";
import WorkerListItem from "employee/components/ListItems/WorkerListItem";
import SwipeableRow, { SwipeableRowRef } from "global/components/SwipeableRow";
import IconButton from "global/components/controls/IconButon";
import { Ico } from "global/icon.def";
import Loading from "global/components/Loading";
import { useGlobalContext } from "global/providers/GlobalProvider";
import OfferListItem from "offer/components/OfferListItem";
import { useTranslation } from "react-i18next";
import { FaUserSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { BtnModes } from "global/interface/controls.interface";
import { UserListedItemService } from "user/services/UserListedItemService";
import { toast } from "react-toastify";
import { useConfirm } from "global/providers/PopupProvider";
import ListedItemNoteField from "user/components/ListedItemNoteField";

const MyListedItemsView: React.FC = () => {

    const userCtx = useUserContext();
    const navigate = useNavigate();
    const { t } = useTranslation()
    const globalCtx = useGlobalContext()
    const confirm = useConfirm()
    const [openNoteItemId, setOpenNoteItemId] = useState<number | null>(null);
    const swipeRefs = useRef<Map<number, SwipeableRowRef>>(new Map());

    const noResults = !userCtx.meCtx?.listedItems?.length;

    if (userCtx.loading) {
        return <Loading></Loading>
    }

    const items = userCtx.meCtx?.listedItems || [];

    // TODO: use i18n
    const unmark = async (item: UserListedItem) => {
        const confirmed = await confirm({
            title: "Czy na pewno chcesz usunąć ten wpis z listy?",
            message: "Ta akcja jest nieodwracalna",
        })
        if (!confirmed) {
            return;
        }
        await UserListedItemService.removeItem(item.id.toString());
        userCtx.updateMeCtx({
            ...userCtx.meCtx,
            listedItems: (userCtx.meCtx?.listedItems ?? []).filter(listItem => listItem.id !== item.id)
        } as Parameters<typeof userCtx.updateMeCtx>[0]);

        toast.success("Usunięto wpis z Twojej listy");
    }

    const openNoteFiledForItem = (item: UserListedItem) => {
        setOpenNoteItemId(prev => prev === item.id ? null : item.id);
        closeItemSwiperRow(item);
    }

    const closeItemSwiperRow = (item: UserListedItem) => {
        swipeRefs.current.get(item.id)?.close();
    }

    return (
        <div className="list-view pt-0">

            {noResults ? (
                <div className="flex flex-col items-center justify-center mt-20">
                    <FaUserSlash className="mx-auto text-4xl mb-2 opacity-50" />
                    <p className="xl-font mb-4 secondary-text">{t('common.noResults')}</p>
                </div>
            ) : (

                <div className="results flex flex-col">

                    {([...items]).map((item, index) => {

                        const rowActions = (
                            <>
                                <IconButton className="p-3"
                                    icon={<Ico.BOOKMARK />}
                                    onClick={() => openNoteFiledForItem(item)}
                                />
                                <IconButton className="p-3" mode={BtnModes.ERROR_TXT}
                                    icon={<Ico.DELETE />}
                                    onClick={() => unmark(item)}
                                />
                            </>
                        );

                        if (item.referenceType === UserListedItemReferenceTypes.WORKER) {
                            return (
                                <div key={index} className={`list-item-border${index === 0 ? " first" : ""}${index === (items?.length ?? 0) - 1 ? " last" : ""}`}>
                                    <SwipeableRow ref={el => el ? swipeRefs.current.set(item.id, el) : swipeRefs.current.delete(item.id)} actions={rowActions}>
                                        <WorkerListItem className="primary-bg"
                                            worker={item.data as WorkerI}
                                            disableDefaultBorder
                                        ></WorkerListItem>
                                    </SwipeableRow>
                                    <ListedItemNoteField
                                        item={item}
                                        open={openNoteItemId === item.id}
                                        onClose={() => setOpenNoteItemId(null)}
                                    />
                                </div>
                            )
                        }

                        if (item.referenceType === UserListedItemReferenceTypes.OFFER) {
                            return (
                                <React.Fragment key={item.data.offerId}>
                                    <SwipeableRow ref={el => el ? swipeRefs.current.set(item.id, el) : swipeRefs.current.delete(item.id)} actions={rowActions}>
                                        <OfferListItem
                                            offer={item.data}
                                            first={index === 0}
                                            last={index === (items?.length ?? 0) - 1}
                                            disableDefaultBorder
                                        ></OfferListItem>
                                    </SwipeableRow>
                                    <ListedItemNoteField
                                        item={item}
                                        open={openNoteItemId === item.id}
                                        onClose={() => setOpenNoteItemId(null)}
                                    />
                                </React.Fragment>
                            )
                        }
                        return null;

                    })}


                </div>

            )}
        </div>

    )
}

export default MyListedItemsView;