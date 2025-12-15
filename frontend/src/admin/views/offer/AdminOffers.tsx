import Loading from "global/components/Loading";
import { useEffect, useState, useCallback } from "react";
import IconButton from "global/components/controls/IconButon";
import DeleteIcon from '@mui/icons-material/Delete';
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import { useConfirm } from "global/providers/PopupProvider";
import { toast } from "react-toastify";
import { Util } from "@shared/utils/util";
import { userAdminPanelContext } from "../AdminPanelProvider";
import Button from "global/components/controls/Button";
import { OfferI } from "@shared/interfaces/OfferI";
import { OffersAdminService } from "admin/services/OffersAdmin.service";

const AdminOffers: React.FC = () => {

    // TODO paginacja ofert - admin panel

    const [loading, setLoading] = useState(false);
    const [selectedOffer, setSelectedOffer] = useState<OfferI | null>(null);

    const adminPanelCtx = userAdminPanelContext();
    const offersCtx = adminPanelCtx?.offers;

    const confirm = useConfirm();

    const _initOffers = async () => {
        try {
            setLoading(true);
            await offersCtx?.initOffers();
            setSelectedOffer(null);
        }
        finally {
            setLoading(false);
        }
    }


    useEffect(() => {
        _initOffers();
    }, []);

    // Escape key handler to clear selected profile
    const handleEscape = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            setSelectedOffer(null);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [handleEscape]);

    if (loading) {
        return <Loading />;
    }

    const onSelectOffer = (offer: OfferI) => {
        setSelectedOffer(offer)
    }

    const handleCleanAll = async () => {
        const confirmed = await confirm({
            title: "Are you sure?",
            message: "Are you sure you want to export all offers? This action cannot be undone.",
        })
        if (!confirmed) return;
        try {
            setLoading(true);
            await OffersAdminService.deleteAllOffers();
            await _initOffers();
            toast.success('All offers have been deleted.');
        } catch (e) { } finally {
            setLoading(false);
        }
    }

    const handleInitialLoad = async () => {
        try {
            setLoading(true);
            await OffersAdminService.initialLoad();
            await _initOffers();
        } catch (e) {
            console.error(e);
            toast.error('Failed to perform initial load of offers.');
        } finally {
            setLoading(false);
        }
    }

    const handleOfferAction = async (offer: OfferI) => {
        const confirmed = await confirm({
            title: "Are you sure?",
            message: "Are you sure you want to delete this offer? This action cannot be undone.",
        });
        if (!confirmed) return;

        try {
            setLoading(true);
            await OffersAdminService.deleteOffer(offer.offerId);
            await _initOffers();
            toast.success('Offer has been deleted.');
        } catch (e) { } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-2 items-center w-full p-5">
            <div className="w-full px-0">

                <h2 className="h2 mb-6 pl-2 primary-text">Offers Admin Panel</h2>

                <div className="flex gap-2 mb-10 mt-5">

                    {!!offersCtx?.offers?.length && (
                        <Button
                            mode={BtnModes.PRIMARY_TXT}
                            onClick={handleCleanAll}
                        >Clean all</Button>
                    )}

                    <Button
                        mode={BtnModes.PRIMARY_TXT}
                        onClick={handleInitialLoad}
                    >Initial Load</Button>

                </div>

                <h2 className="font-mono font-bold mb-2 mt-10">List of offers:</h2>

                <div className="overflow-x-auto w-full rounded-lg shadow border border-color secondary-bg">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">id</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">status</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">display name</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">category</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">locationCountry</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text">createdAt</th>
                                <th className="px-6 py-3 border-b-2 border-color text-sm font-semibold secondary-text"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {offersCtx?.offers?.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-6 secondary-text text-center">No offers found.</td>
                                </tr>
                            ) : (
                                offersCtx?.offers?.map((offer, idx) => {
                                    const isSelected = selectedOffer?.offerId === offer.offerId;
                                    return (
                                        <tr
                                            key={idx}
                                            className={`hover-bg transition cursor-pointer${isSelected ? ' active' : ''}`}
                                            style={{ userSelect: 'none' }}
                                            onClick={() => onSelectOffer(offer)}
                                        >
                                            <td className="px-6 py-3 border-b border-color font-mono text-base primary-text">{offer.offerId}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{offer.status}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{offer.displayName}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{offer.category}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{offer.locationCountry}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">{Util.displayDate(offer.createdAt)}</td>
                                            <td className="px-6 py-3 border-b border-color primary-text">
                                                <div className="flex gap-2 justify-end">
                                                    <IconButton icon={<DeleteIcon />} size={BtnSizes.SMALL} mode={BtnModes.ERROR} onClick={() => handleOfferAction(offer)} />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>

                </div>

            </div>
        </div>
    )
}

export default AdminOffers;