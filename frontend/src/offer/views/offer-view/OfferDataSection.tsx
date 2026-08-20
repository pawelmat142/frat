import { OfferI } from "@shared/interfaces/OfferI";
import { PositionUtil } from "@shared/utils/PositionUtil";
import TileSection from "employee/components/TileSection";
import DateDisplay from "global/components/ui/DateDisplay";
import DictionaryDisplay from "global/components/ui/DictionaryDisplay";
import ListUi from "global/components/ui/ListUi";
import { useIsDesktop } from "global/hooks/isMobile";
import { Ico } from "global/icon.def";
import { MenuItem } from "global/interface/controls.interface";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useUserContext } from "user/UserProvider";

interface Props {
  offer: OfferI;
}

const OfferDataSection: React.FC<Props> = ({ offer }) => {
  const userCtx = useUserContext();
  const isDesktop = useIsDesktop();
  const { t } = useTranslation();

  const me = userCtx?.me;

  const isMyOffer = me?.uid === offer!.uid;

  const openPhoneCall = () => {
    if (!offer.phoneNumber || isMyOffer) return;

    const number = `${offer.phoneNumber.prefix}${offer.phoneNumber.number}`;
    if (isDesktop) {
      // copy to clipboard
      navigator.clipboard.writeText(number);
      toast.info(t("employeeProfile.phoneNumberCopied", { number }));
      return;
    }
    window.location.href = `tel:${offer.phoneNumber.prefix}${offer.phoneNumber.number}`;
  };

  const getDistanceInfo = (): string => {
    if (!offer?.point) {
      return "";
    }

    const distanceInfo = userCtx.getDistanceInfo(
      PositionUtil.fromGeoPoint(offer.point),
    );
    if (!distanceInfo) {
      return "";
    }

    return `(${distanceInfo} ${t("others.away")})`;
  };

//   TODO translations
  const listItems: MenuItem[] = [
    {
      label: `Starts from: ${DateDisplay({
        date: new Date(offer.startDate!),
        showYear: false,
        t,
      })}`,
      icon: Ico.CALENDAR,
    },
    {
      if: offer.phoneNumber,
      label: `${t("employeeProfile.form.phoneNumber")}: ${offer.phoneNumber.prefix} ${offer.phoneNumber.number}`,
      icon: Ico.PHONE,
      onClick: openPhoneCall,
    },
    {
      if: offer.displayAddress,
      label: offer.displayAddress + " " + getDistanceInfo(),
      icon: Ico.MARKER,
    },
    {
      if: !!offer.languagesRequired?.length,
      label: `${t("offer.languagesRequired")}: ${offer.languagesRequired?.map((lang) => DictionaryDisplay({ dictionary: "LANGUAGES", value: lang, t }))}`,
      icon: Ico.LANGUAGE,
    },
  ];

  return (
    <>
      <TileSection>
        <ListUi items={listItems} className="pb-1"></ListUi>
      </TileSection>
    </>
  );
};

export default OfferDataSection;
