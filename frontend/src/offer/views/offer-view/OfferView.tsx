import { OfferI, OfferStatuses } from "@shared/interfaces/OfferI";
import Loading from "global/components/Loading";
import { OffersService } from "offer/services/OffersService";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useUserContext } from "user/UserProvider";
import { MenuConfig } from "global/components/selector/MenuItems";
import { toast } from "react-toastify";
import { useConfirm } from "global/providers/PopupProvider";
import { Path } from "../../../path";
import Header from "global/components/Header";
import { deleteOfferConfirm } from "employee/def";
import { Ico } from "global/icon.def";
import { useGlobalContext } from "global/providers/GlobalProvider";
import OfferStatItems from "offer/components/OfferStatItems";
import OfferAvatarMock from "offer/components/OfferAvatarMock";
import ListItemImg from "global/components/ListItemImg";
import { AppConfig } from "@shared/AppConfig";
import OfferDataSection from "./OfferDataSection";
import TileSection from "global/components/tiles/TileSection";
import UserItemTile from "user/components/UserItemTile";
import OfferCertificatesSection from "./OfferCertificatesSection";
import { UserListedItemReferenceTypes, UserListedItemTypes } from "@shared/interfaces/UserListedItem";
import { UserListedItemService } from "user/services/UserListedItemService";

const OfferView: React.FC = () => {
  const params = useParams<{ offerId?: string }>();
  const offerId = params.offerId;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const userCtx = useUserContext();
  const globalCtx = useGlobalContext();

  const confirm = useConfirm();
  const me = userCtx?.me;

  const isSavedOnList = (userCtx.meCtx?.listedItems ?? [])
    .some(item => item.reference === offerId && item.referenceType === UserListedItemReferenceTypes.OFFER);

  const [offer, setOffer] = useState<OfferI | null>(null);
  const [loading, setLoading] = useState(false);

  const getOfferMenuItems = (offer: OfferI): MenuConfig => {
    const isMyOffer = me?.uid === offer!.uid;

    const menu: MenuConfig = {
      title: t("offer.offerMenu"),
      items: [
        {
          label: t("offer.editButton"),
          if: isMyOffer,
          onClick: () => {
            goToEditForm(offer);
          },
          icon: Ico.EDIT,
        },
        {
          label:
            offer.status === OfferStatuses.ACTIVE
              ? t("offer.deactivateButton")
              : t("offer.activateButton"),
          if: isMyOffer,
          onClick: () => {
            offerActivation(offer);
          },
          icon: offer.status === OfferStatuses.ACTIVE ? Ico.CANCEL : Ico.CHECK,
        },
        {
          label: t("offer.deleteButton"),
          if: isMyOffer,
          onClick: () => {
            deleteOffer(offer);
          },
          icon: Ico.DELETE,
        },
        {
          label: t("user.removeFromList"),
          if: !isMyOffer && isSavedOnList,
          onClick: removeListItem,
          icon: Ico.STAR,
        },
        {
          label: t("user.addToList"),
          if: !isMyOffer && !isSavedOnList,
          onClick: addListItem,
          icon: Ico.STAR,
        },
      ],
    };
    return menu;
  };

  useEffect(() => {
    const initOffer = async () => {
      if (offerId) {
        const o = userCtx.meCtx?.offers.find((o) => o.offerId === offerId);
        if (o) {
          _setOffer(o);
          return;
        }
        try {
          setLoading(true);
          const result = await OffersService.getOfferById(offerId);
          _setOffer(result);
        } finally {
          setLoading(false);
        }
      }
    };
    initOffer();
  }, []);

  const _setOffer = (offer: OfferI | null) => {
    setOffer(offer);
    if (offer?.offerId) {
      OffersService.notifyOfferView(offer.offerId);
    }
  };

  if (loading || globalCtx.loading || !globalCtx.dics.languages) {
    return <Loading />;
  }
  if (!offer) {
    return <div>{t("common.noResults")}</div>;
  }

  const goToEditForm = async (offer: OfferI) => {
    navigate(Path.getOfferFormEditPath(offer.offerId));
  };

  const addListItem = async () => {
    if (me?.uid === offer?.uid || !userCtx.meCtx || !offer) return;
    const meCtx = userCtx.meCtx;
    try {
      setLoading(true);
      const item = await UserListedItemService.addItem({
        reference: offer.offerId.toString(),
        referenceType: UserListedItemReferenceTypes.OFFER,
        listedType: UserListedItemTypes.DEFAULT,
      });
      if (!item) {
        toast.error(t("user.addToListError"));
        return;
      }
      userCtx.updateMeCtx({
        ...meCtx,
        listedItems: [...(meCtx.listedItems ?? []), item],
      });
      toast.success(t("user.addToListSuccess"));
    } finally {
      setLoading(false);
    }
  };

  const removeListItem = async () => {
    if (me?.uid === offer?.uid || !userCtx.meCtx || !offer) return;
    const listItem = (userCtx.meCtx.listedItems ?? [])
      .find(item => item.reference === offer.offerId.toString() && item.referenceType === UserListedItemReferenceTypes.OFFER);
    if (!listItem) return;
    const meCtx = userCtx.meCtx;
    try {
      setLoading(true);
      await UserListedItemService.removeItem(listItem.id.toString());
      userCtx.updateMeCtx({
        ...meCtx,
        listedItems: (meCtx.listedItems ?? []).filter(item => item.id !== listItem.id),
      } as Parameters<typeof userCtx.updateMeCtx>[0]);
      toast.success(t("user.removeFromListSuccess"));
    } finally {
      setLoading(false);
    }
  };

  const deleteOffer = async (offer: OfferI) => {
    if (!(await confirm(deleteOfferConfirm(t)))) {
      return;
    }
    try {
      setLoading(true);
      await OffersService.deleteOffer(offer.offerId);
      await userCtx.initOffers();
      toast.success(t("offer.deleteSuccessToast"));
      navigate(-1);
    } finally {
      setLoading(false);
      userCtx.setLoading(false);
    }
  };

  const offerActivation = async (offer: OfferI) => {
    try {
      setLoading(true);
      const result = await OffersService.activation(offer.offerId);
      setOffer(result);
      if (OfferStatuses.ACTIVE === result.status) {
        toast.success(t("offer.activationSuccessToast"));
      } else {
        toast.success(t("offer.deactivationSuccessToast"));
      }
    } finally {
      setLoading(false);
    }
  };

  const isMyOffer = me?.uid === offer.uid;

  const avatarMock = offer.avatarRef ? undefined : (
    <OfferAvatarMock offer={offer} size={AppConfig.AVATAR.SIZE.BIG}/>
  );

  return (
    <>
      <Header
        title={t("offer.offerViewTitle")}
        menu={getOfferMenuItems(offer)}
      />

      <div className="w-full flex-1">
        <div className="flex gap-3 items-center view-margin">
          <ListItemImg
            imgUrl={offer.avatarRef?.url}
            component={avatarMock}
            size={AppConfig.AVATAR.SIZE.BIG}
          />

          <div className="worker-profile-top">
            <div className="worker-profile-top-row two">
              <div>
                <div className="l-font font-semibold">{offer.displayName}</div>
              </div>
            </div>
            <div className="worker-profile-top-row three">
              <OfferStatItems offer={offer} />
            </div>
          </div>
        </div>

        <OfferDataSection offer={offer} />

        <TileSection title={t("offer.descriptionTitle")}>
          <div className="p-3">{offer.description}</div>
        </TileSection>

        <TileSection title={t("offer.addedBy")}>
          <div>
            <UserItemTile uid={offer.uid} showChat={!isMyOffer} showNumber />
          </div>
        </TileSection>

        <OfferCertificatesSection offer={offer} />
      </div>

    </>
  );
};

export default OfferView;
