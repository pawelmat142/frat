import React from "react";
import { OfferI } from "@shared/interfaces/OfferI";
import { AppConfig } from "@shared/AppConfig";
import Button from "global/components/controls/Button";
import { BtnModes } from "global/interface/controls.interface";
import { MenuConfig } from "global/components/selector/MenuItems";
import OfferAvatarMock from "offer/components/OfferAvatarMock";
import OfferStatItems from "offer/components/OfferStatItems";
import OfferDataSection from "./OfferDataSection";
import OfferCertificatesSection from "./OfferCertificatesSection";
import TileSection from "global/components/tiles/TileSection";
import UserItemTile from "user/components/UserItemTile";
import { useUserContext } from "user/UserProvider";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { Path } from "../../../path";

interface Props {
  offer: OfferI;
  menu: MenuConfig;
}

const DesktopOfferView: React.FC<Props> = ({ offer, menu }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { me } = useUserContext();

  const fromSearchView = location.state?.fromSearchView === true;
  const isMyOffer = me?.uid === offer.uid;
  const menuItems = menu.items.filter(item => item.if === undefined || !!item.if);

  return (
    <div className="desktop-offer-profile">
      <header className="desktop-offer-profile-view-header">
        {fromSearchView && (
          <Button
            mode={BtnModes.TERTIARY_TXT}
            className="desktop-offer-profile-back"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft size={14} />
            {t("employeeProfile.backToSearch")}
          </Button>
        )}
        <h1 className="desktop-offer-profile-view-title">{t("offer.offerViewTitle")}</h1>
      </header>

      <div className="desktop-offer-profile-content">
        <main className="desktop-offer-profile-main">
          <section className="desktop-offer-profile-header">
            <div className="desktop-offer-profile-image">
              {offer.avatarRef?.url ? (
                <img src={offer.avatarRef.url} alt={offer.displayName || t("offer.untitled")} />
              ) : (
                <OfferAvatarMock offer={offer} size={15} />
              )}
            </div>
            <div className="desktop-offer-profile-summary">
              <h2 className="desktop-offer-profile-name">{offer.displayName || t("offer.untitled")}</h2>
              <OfferStatItems offer={offer} />
            </div>
          </section>

          <TileSection
            title={t("offer.addedBy")}
            onClick={() => navigate(Path.getProfilePath(offer.uid))}
          >
            <UserItemTile uid={offer.uid} showChat={!isMyOffer} showNumber />
          </TileSection>

          <TileSection title={t("offer.descriptionTitle")}>
            <div className="p-3">{offer.description}</div>
          </TileSection>
        </main>

        <aside className="desktop-offer-profile-sidebar">
          {menuItems.length > 0 && (
            <section className="desktop-offer-profile-menu active-bg rounded-xl shadow-xl py-1 overflow-hidden select-none">
              {menu.title && (
                <div className="secondary-text px-4 pt-2 pb-1 text-xs font-medium">
                  {menu.title}
                </div>
              )}
              {menuItems.map((item, index) => (
                <button
                  key={`${item.label}-${index}`}
                  type="button"
                  className={`rounded ripple flex items-center gap-3 w-full px-4 text-sm text-left transition-colors hover-secondary-bg${item.className ? ` ${item.className}` : ""}`}
                  style={{ height: AppConfig.CONTEXT_MENU.ITEM_HEIGHT }}
                  onClick={() => item.onClick?.()}
                >
                  {item.icon && <item.icon size={15} className="flex-shrink-0" />}
                  <span>{item.label}</span>
                </button>
              ))}
            </section>
          )}

          <OfferDataSection offer={offer} />
          <OfferCertificatesSection offer={offer} />
        </aside>
      </div>
    </div>
  );
};

export default DesktopOfferView;