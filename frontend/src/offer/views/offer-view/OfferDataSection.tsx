import { OfferI } from "@shared/interfaces/OfferI";
import { DateRange } from "@shared/interfaces/WorkerI";
import { DateUtil } from "@shared/utils/DateUtil";
import { PositionUtil } from "@shared/utils/PositionUtil";
import TileSection from "employee/components/TileSection";
import CallendarsView from "global/components/callendar/CallendarsView";
import CategoriesChips from "global/components/chips/CategoriesChips";
import PseudoView from "global/components/PseudoView";
import DateDisplay from "global/components/ui/DateDisplay";
import DictionaryDisplay from "global/components/ui/DictionaryDisplay";
import ListUi from "global/components/ui/ListUi";
import { useFloatingBtnContext } from "global/fab/FloatingBtnProvider";
import { useIsDesktop } from "global/hooks/isMobile";
import { Ico } from "global/icon.def";
import { MenuItem } from "global/interface/controls.interface";
import { useBottomSheet } from "global/providers/BottomSheetProvider";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useUserContext } from "user/UserProvider";

interface Props {
  offer: OfferI;
}

const OfferDataSection: React.FC<Props> = ({ offer }) => {
  const userCtx = useUserContext();
  const isDesktop = useIsDesktop();
  const globalCtx = useGlobalContext();
  const floatingBtnCtx = useFloatingBtnContext();
  const bottomSheetCtx = useBottomSheet();
  const { t } = useTranslation();

  const [openPseudoView, setOpenPseudoView] = useState(false);

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

  const ranges: DateRange[] = [
    { start: DateUtil.toLocalDateString(offer.startDate) },
  ];

  const onAvailabilityClick = () => {
    setOpenPseudoView(true);
    globalCtx.hideFooter();
    floatingBtnCtx.hide();
  };

  const listItems: MenuItem[] = [
    {
      label: t("offer.workCategory"),
      labelComponent: (
        <span className="flex gap-2 items-center">
          {t("offer.workCategory")}:{" "}
          <CategoriesChips
            categories={[offer.category]}
            smaller
            color="primary"
          />
        </span>
      ),
      icon: Ico.CATEGORIES,
    },
    {
      label: `${t("offer.startsFrom")}: ${DateDisplay({
        date: new Date(offer.startDate!),
        showYear: false,
        showFullMonthName: true,
        t,
      })}`,
      icon: Ico.CALENDAR,
      onClick: onAvailabilityClick,
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
    {
      if: offer.salary && offer.currency,
      label: `${t("offer.salary")}: ${offer.salary} ${offer.currency}`,
      icon: Ico.SALARY,
    },
  ];

  return (
    <>
      <TileSection>
        <ListUi items={listItems} className="pb-1"></ListUi>
      </TileSection>

      <PseudoView show={openPseudoView}>
        <CallendarsView
          title={t("offer.dateRange")}
          ranges={ranges}
          bottomSheetCtx={bottomSheetCtx}
          onClose={() => {
            setOpenPseudoView(false);
            globalCtx.showFooter();
            floatingBtnCtx.show();
          }}
        />
      </PseudoView>
    </>
  );
};

export default OfferDataSection;
