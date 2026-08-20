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
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import OfferStatItems from "offer/components/OfferStatItems";
import OfferAvatarMock from "offer/components/OfferAvatarMock";
import ListItemImg from "global/components/ListItemImg";
import { AppConfig } from "@shared/AppConfig";
import OfferDataSection from "./OfferDataSection";
import TileSection from "employee/components/TileSection";
import { DateRange } from "@shared/interfaces/WorkerI";
import { DateUtil } from "@shared/utils/DateUtil";

const OfferView: React.FC = () => {
  const params = useParams<{ offerId?: string }>();
  const offerId = params.offerId;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const userCtx = useUserContext();
  const globalCtx = useGlobalContext();

  const confirm = useConfirm();
  const me = userCtx?.me;

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
    <OfferAvatarMock offer={offer} />
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
            size={AppConfig.DEFAULT_AVATAR_SIZE_BIG}
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

        {/* TODO translations */}
        <TileSection title={"Description"}>
          <div className="p-3">{offer.description}</div>
        </TileSection>

        {/* TODO dodane przez tile */}

      </div>

    </>
  );
};

export default OfferView;
