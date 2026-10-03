import { OfferI } from "@shared/interfaces/OfferI";
import IconButton from "global/components/controls/IconButon";
import { useOpenChat } from "chat/hooks/useOpenChat";
import { Ico } from "global/icon.def";
import { useGlobalContext } from "global/providers/GlobalProvider";
import { useUserContext } from "user/UserProvider";
import OfferListItem from "./OfferListItem";
import { Path } from "../../../path";
import { useNavigate } from "react-router-dom";

interface Props {
  offer: OfferI;
  first?: boolean;
  last?: boolean;
  disableDefaultBorder?: boolean;
  className?: string;
  onSelect?: (offer: OfferI) => void;
  selected?: boolean;
}

const OfferSearchListItem: React.FC<Props> = ({
  offer,
  first,
  last,
  disableDefaultBorder,
  className,
  onSelect,
  selected,
}) => {
  const userCtx = useUserContext();
  const { me } = userCtx;

  const { isDesktop } = useGlobalContext();
  const navigate = useNavigate();
  const openChat = useOpenChat();
  const isMyOffer = me?.uid === offer.uid;
  const showDesktopOfferButton = isDesktop && !!onSelect;

  const openOffer = () => {
    navigate(Path.getOfferPath(offer.offerId));
  };

  const rightSection = (showDesktopOfferButton || !isMyOffer) ? (
    <div className="flex justify-end items-center gap-2">
      {!isMyOffer && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            openChat(offer.uid);
          }}
          icon={<Ico.MSG size={20} />}
        />
      )}
      {showDesktopOfferButton && (
        <IconButton
          icon={<Ico.CHEVRON_RIGHT size={20} />}
          onClick={(event) => {
            event.stopPropagation();
            openOffer();
          }}
        />
      )}
    </div>
  ) : null;

  return (
    <OfferListItem
      className={className}
      offer={offer}
      first={first}
      last={last}
      disableDefaultBorder={disableDefaultBorder}
      rightSection={rightSection}
      onClick={onSelect ? () => onSelect(offer) : undefined}
      selected={selected}
    ></OfferListItem>
  );
};

export default OfferSearchListItem;
