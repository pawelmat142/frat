import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OfferI } from "@shared/interfaces/OfferI";
import { AppConfig } from "@shared/AppConfig";
import ListItemImg from "global/components/ListItemImg";
import Button from "global/components/controls/Button";
import TileSection from "global/components/tiles/TileSection";
import { BtnModes } from "global/interface/controls.interface";
import { Ico } from "global/icon.def";
import { Path } from "../../../path";
import OfferAvatarMock from "offer/components/OfferAvatarMock";
import OfferStatItems from "offer/components/OfferStatItems";
import OfferDataSection from "offer/views/offer-view/OfferDataSection";
import OfferCertificatesSection from "offer/views/offer-view/OfferCertificatesSection";
import { useOpenChat } from "chat/hooks/useOpenChat";
import { useUserContext } from "user/UserProvider";

interface Props {
  offer: OfferI;
}

const DesktopOfferSearchPreview: React.FC<Props> = ({ offer }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const openChat = useOpenChat();
  const { me } = useUserContext();
  const shouldReduceMotion = useReducedMotion();
  const isMyOffer = me?.uid === offer.uid;
  const avatarMock = offer.avatarRef ? undefined : <OfferAvatarMock offer={offer} size={AppConfig.AVATAR.SIZE.BIG} />;

  return (
    <motion.aside
      className="offers-search-preview"
      initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 32, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -20, scale: 0.98 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 0.7, 0.3, 1] }}
    >
      <div className="offers-search-preview-header">
        <ListItemImg imgUrl={offer.avatarRef?.url} component={avatarMock} size={AppConfig.AVATAR.SIZE.BIG} />
        <div className="offers-search-preview-title">
          <div className="l-font font-semibold">{offer.displayName || t("offer.untitled")}</div>
          <OfferStatItems offer={offer} />
        </div>
        <div className="flex items-center justify-center gap-2">
          {!isMyOffer && (
            <Button mode={BtnModes.PRIMARY_TXT} onClick={() => openChat(offer.uid)}>
              <Ico.MSG size={16} />
              {t("chat.openChat")}
            </Button>
          )}
          <Button mode={BtnModes.PRIMARY} onClick={() => navigate(Path.getOfferPath(offer.offerId))}>
            {t("offer.offerViewTitle")}
            <Ico.CHEVRON_RIGHT size={16} />
          </Button>
        </div>
      </div>

      <OfferDataSection offer={offer} />
      {!!offer.description && (
        <TileSection title={t("offer.descriptionTitle")}>
          <div className="p-3">{offer.description}</div>
        </TileSection>
      )}
      <OfferCertificatesSection offer={offer} />
    </motion.aside>
  );
};

export default DesktopOfferSearchPreview;