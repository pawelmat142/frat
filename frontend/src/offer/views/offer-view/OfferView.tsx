import { OfferI, OfferStatuses } from "@shared/interfaces/OfferI";
import { useAuthContext } from "auth/AuthProvider";
import CallendarTile from "employee/views/profile/CallendarTile";
import EditButton from "global/components/buttons/EditButton";
import Chips, { ChipModes } from "global/components/chips/Chips";
import Loading from "global/components/Loading";
import Flags from "global/components/Flags";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { OffersService } from "offer/services/OffersService";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import OfferDetailsTile from "./OfferDetailsTile";
import { MenuConfig } from "global/components/selector/MenuItems";
import { useMenuContext } from "global/providers/MenuProvider";
import { toast } from "react-toastify";
import { useConfirm } from "global/providers/PopupProvider";
import { Path } from "../../../path";
import { Utils } from "global/utils/utils";

const OfferView: React.FC = () => {

    const params = useParams<{ offerId?: string }>()
    const offerId = params.offerId

    const { me } = useAuthContext();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userCtx = useUserContext();
    const globalCtx = useGlobalContext();
    const menuCtx = useMenuContext();
    const confirm = useConfirm();

    const [offer, setOffer] = useState<OfferI | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (offer && me) {
            menuCtx.setupHeaderMenu(getOfferMenuItems(offer))
        }
    }, [offer, me]);

    const getOfferMenuItems = (offer: OfferI): MenuConfig => {
        const isMyOffer = me?.uid === offer!.uid;

        const menu: MenuConfig = {
            title: t('offer.offerMenu'),
            items: []
        }

        if (isMyOffer) {
            menu.items.push({
                label: t('offer.editButton'),
                onClick: () => { goToEditForm(offer) }
            })
            menu.items.push({
                label: offer.status === OfferStatuses.ACTIVE ? t('offer.deactivateButton') : t('offer.activateButton'),
                onClick: () => { offerActivation(offer) }
            })
            menu.items.push({
                label: t('offer.deleteButton'),
                onClick: () => { deleteOffer(offer) }
            })
        } else {
            menu.items.push({
                label: t('offer.likeButton'),
                onClick: () => { likeOffer(offer) }
            })
        }
        return menu;
    }

    useEffect(() => {
        const initOffer = async () => {
            const oid = Number(offerId);
            if (oid) {
                const o = userCtx.offers?.find(o => o.offerId === oid);
                if (o) {
                    _setOffer(o);
                    return;
                }
                try {
                    setLoading(true);
                    const result = await OffersService.getOfferById(oid);
                    _setOffer(result);
                }
                finally {
                    setLoading(false);
                }
            }
        }
        initOffer()
    }, [])

    const _setOffer = (offer: OfferI | null) => {
        setOffer(offer);
        if (offer?.offerId) {
            OffersService.notifyOfferView(offer.offerId);
        }
    }

    if (loading || globalCtx.loading || !globalCtx.dics.languages) {
        return <Loading />
    }
    if (!offer) {
        return <div>{t("common.noResults")}</div>
    }

    const goToEditForm = async (offer: OfferI) => {
        navigate(Path.getOfferFormEditPath(offer.offerId));
    }

    const deleteOffer = async (offer: OfferI) => {
        const confirmed = await confirm({
            title: t('offer.deleteConfirmTitle'),
            message: t('offer.deleteConfirmMessage'),
        })
        if (!confirmed) {
            return;
        }
        try {
            setLoading(true);
            await OffersService.deleteOffer(offer.offerId);
            await userCtx.initOffers();
            toast.success(t('offer.deleteSuccessToast'));
            navigate(-1);
        }
        finally {
            setLoading(false);
            userCtx.setLoading(false);
        }
    }

    const offerActivation = async (offer: OfferI) => {
        try {
            setLoading(true);
            const result = await OffersService.activation(offer.offerId)
            setOffer(result);
            if (OfferStatuses.ACTIVE === result.status) {
                toast.success(t('offer.activationSuccessToast'));
            } else {
                toast.success(t('offer.deactivationSuccessToast'));
            }
        }
        finally {
            setLoading(false);
        }
    }

    const likeOffer = async (offer: OfferI) => {
        try {
            setLoading(true);
            const likesBefore = offer.likes?.length || 0;
            const likes = await OffersService.notifyOfferLike(offer.offerId);
            offer.likes = likes;
            setOffer({ ...offer });
            if (offer.likes?.length > likesBefore) {
                toast.success(t('offer.likeSuccessToast'));
            } else {
                toast.info(t('offer.likeRemoveToast'));
            }
        }
        finally {
            setLoading(false);
        }
    }


    const isMyOffer = me?.uid === offer.uid;

    return (
        <div className="view-container">

            <div>
                <div className="main-tiles">

                    <OfferDetailsTile offer={offer} />

                    <CallendarTile range={{ start: offer.startDate, end: offer.endDate }}></CallendarTile>

                    <div className="square-tile col-tile"></div>

                </div>

                {!!offer.skillsRequired?.length && (<>
                    <div className="mt-5 mb-1 secondary-text">{t('offer.skillsRequired')}: </div>
                    <Chips chips={offer.skillsRequired || []} mode={ChipModes.TERTIARY}></Chips>
                </>)}
                {!!offer.skillsNiceToHave?.length && (<>
                    <div className="mt-3 mb-1 secondary-text">{t('offer.skillsNiceToHave')}: </div>
                    <Chips chips={offer.skillsNiceToHave || []} mode={ChipModes.SECONDARY}></Chips>
                </>)}

                {!!offer.certificatesRequired?.length && (<>
                    <div className="mt-5 mb-1 secondary-text">{t('offer.certificatesRequired')}: </div>
                    <Chips chips={offer.certificatesRequired || []} mode={ChipModes.TERTIARY}></Chips>
                </>)}
                {!!offer.certificatesNiceToHave?.length && (<>
                    <div className="mt-3 mb-1 secondary-text">{t('offer.certificatesNiceToHave')}: </div>
                    <Chips chips={offer.certificatesNiceToHave || []} mode={ChipModes.SECONDARY}></Chips>
                </>)}

                {!!offer.languagesRequired?.length && (<div>
                    <div className="mt-5 mb-1 secondary-text">{t('offer.languagesRequired')}: </div>
                    <Flags languages={offer.languagesRequired!} />
                    <div className="mt-1 xs-font secondary-text">{Utils.prepareLanguageNames(t, offer.languagesRequired!, globalCtx.dics.languages!)}</div>
                </div>)}
                {!!offer.languagesNiceToHave?.length && (<div>
                    <div className="mt-3 mb-1 secondary-text">{t('offer.languagesNiceToHave')}: </div>
                    <Flags languages={offer.languagesNiceToHave!} />
                    <div className="mt-1 xs-font secondary-text">{Utils.prepareLanguageNames(t, offer.languagesNiceToHave!, globalCtx.dics.languages!)}</div>
                </div>)}

                {isMyOffer && (
                    <div className="mt-10 mb-10">
                        <EditButton onClick={() => goToEditForm(offer)} label={t('offer.editButton')}></EditButton>
                    </div>
                )}


            </div>
        </div>

    )
}

export default OfferView;