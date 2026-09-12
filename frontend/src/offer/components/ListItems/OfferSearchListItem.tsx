import { OfferI } from "@shared/interfaces/OfferI";
import { useTranslation } from "react-i18next";
import IconButton from "global/components/controls/IconButon";
import { toast } from "react-toastify";
import { useOpenChat } from "chat/hooks/useOpenChat";
import { useIsDesktop } from "global/hooks/isMobile";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import OfferListItem from "./OfferListItem";

interface Props {
  offer: OfferI;
  first?: boolean;
  last?: boolean;
  disableDefaultBorder?: boolean;
  className?: string;
}

const OfferSearchListItem: React.FC<Props> = ({
  offer,
  first,
  last,
  disableDefaultBorder,
  className,
}) => {
  const { t } = useTranslation();
  const userCtx = useUserContext();
  const { me } = userCtx;

  const isDesktop = useIsDesktop();
  const openChat = useOpenChat();
  const isMyOffer = me?.uid === offer.uid;

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

  const rightSection = isMyOffer ? null : (
    <div className="flex justify-end items-center gap-2">
      {offer.phoneNumber && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            openPhoneCall();
          }}
          icon={<Ico.PHONE size={20} />}
        />
      )}
      {!isMyOffer && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            openChat(offer.uid);
          }}
          icon={<Ico.MSG size={20} />}
        />
      )}
    </div>
  );

  return (
    <OfferListItem
      className={className}
      offer={offer}
      first={first}
      last={last}
      disableDefaultBorder={disableDefaultBorder}
      rightSection={rightSection}
    ></OfferListItem>
  );
};

export default OfferSearchListItem;
