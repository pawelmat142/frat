import { OfferI } from "@shared/interfaces/OfferI"
import { UserI } from "@shared/interfaces/UserI";
import { Path } from "../../path";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThumbUp, Visibility } from "@mui/icons-material";
import ListItem from "global/components/ListItem";
import IconButton from "global/components/controls/IconButon";
import { ChatService } from "chat/services/ChatService";
import { toast } from "react-toastify";
import { useIsDesktop } from "global/hooks/isMobile";
import { Ico } from "global/icon.def";
import { useUserContext } from "user/UserProvider";
import { PositionUtil } from "@shared/utils/PositionUtil";
import { DictionaryUtil } from "@shared/utils/DictionaryUtil";
import { UserPublicService } from "user/services/UserPublicService";
import { useEffect, useState } from "react";
import Chips, { ChipModes } from "global/components/chips/Chips";
import { ParsedPhoneNumber } from "@shared/interfaces/WorkerProfileI";
import Loading from "global/components/Loading";

interface Props {
    offer: OfferI,
    first?: boolean,
    last?: boolean,
}

// TODO move to config
const MINIMUM_DISTANCE_FOR_DISPLAY_METERS = 50000; // 50 km

const OfferListItem: React.FC<Props> = ({ offer, first, last }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const { me } = userCtx;

    const [offerOwner, setOfferOwner] = useState<UserI | null>(null);
    const isDesktop = useIsDesktop();
    const isMyOffer = me?.uid === offer.uid;

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const initOfferOwner = async () => {

            if (isMyOffer) {
                setOfferOwner(me!);
            } else {
                try {
                    // TODO store users in global state
                    setLoading(true);
                    const result = await UserPublicService.fetchUser(offer.uid);
                    setOfferOwner(result);
                } catch (error) {
                    toast.error(t('offer.error.fetchingOfferOwner'));
                }
                finally {
                    setLoading(false);
                }
            }
        }
        initOfferOwner();   
    }, []);

    const goToOfferView = () => {
        navigate(Path.getOfferPath(offer.offerId));
    }

    const getDistanceInfo = (): string => {
        if (!userCtx.position || !offer.point) {
            return '';
        }
        const meters = PositionUtil.getDistanceFromToInMeters(userCtx.position, PositionUtil.fromGeoPoint(offer.point));

        if (meters < MINIMUM_DISTANCE_FOR_DISPLAY_METERS) { 
            return t("others.lessThan", { distance: MINIMUM_DISTANCE_FOR_DISPLAY_METERS / 1000, unit: 'km' });
        }
        return `${PositionUtil.displayDistance(meters)}`;
    }

    const distance = getDistanceInfo();

    const getPhoneNumber = (): ParsedPhoneNumber => {
        // TODO add phone number to offer
        return {
            prefix: '+55',
            phoneNumber: '555 555 555'
        }
    }

    const openChat = async () => {
        if (!offer || isMyOffer) return;
        try {
            const chat = await ChatService.getOrCreateDirectChat(offer.uid)
            navigate(Path.getConversationPath(chat.chatId))
        } catch (error) {
            console.error('Failed to open chat:', error)
            toast.error(t('chat.error.cannotOpen'))
        }
    }

    const phoneNumber = getPhoneNumber();

    const openPhoneCall = () => {
        if (!phoneNumber || isMyOffer) return;

        const number = `${phoneNumber.prefix}${phoneNumber.phoneNumber}`
        if (isDesktop) {
            // copy to clipboard
            navigator.clipboard.writeText(number);
            toast.info(t('employeeProfile.phoneNumberCopied', { number }));
            return;
        }
        window.location.href = `tel:${phoneNumber.prefix}${phoneNumber.phoneNumber}`;
    }

    const rightSection = isMyOffer ? null : <div className="flex justify-end items-center gap-2">
        {phoneNumber && (
            <IconButton onClick={(e) => {
                e.stopPropagation();
                openPhoneCall();
            }}
                icon={<Ico.PHONE size={20} />}
            />
        )}
        <IconButton onClick={(e) => {
            e.stopPropagation();
            openChat();
        }}
            icon={<Ico.MSG size={20} />}
        />
    </div>

    const categoryChip = offer.category ? (
        <Chips 
            chips={[t(DictionaryUtil.getTranslationKey('WORK_CATEGORY', offer.category))]} 
            mode={ChipModes.SECONDARY}
        />
    ) : null;

    const topLeft = (
        <div>
            <div className="font-medium truncate">
                {offer.displayName || t('offer.untitled')}
            </div>
        </div>
    );

    const bottomLeft = <div className="flex flex-col gap-2 mt-2">
        <div className="flex items-center gap-3">
            {categoryChip}
            <div>
                <Visibility fontSize="inherit" className="secondary-text mr-1" />
                <span className="small-font">{offer.views?.length || 0}</span>
            </div>
            <div>
                <ThumbUp fontSize="inherit" className="secondary-text mr-1" />
                <span className="small-font">{offer.likes?.length || 0}</span>
            </div>

            {!!distance && (
                <div className="flex items-center">
                    <Ico.MARKER size={14} className="secondary-text mr-1" />
                    <span className="small-font">{distance}</span>
                </div>
            )}
        </div>
    </div>

    if (loading) {
        return <Loading></Loading>
    }

    return (
        <div onClick={goToOfferView}>
            <ListItem
                topLeft={topLeft}
                bottomLeft={bottomLeft}
                first={first}
                last={last}
                rightSection={rightSection}
            />
        </div>
    )

}

export default OfferListItem;
