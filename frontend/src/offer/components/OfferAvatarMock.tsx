import { OfferI } from "@shared/interfaces/OfferI";
import AvatarMock from "global/components/AvatarMock";

interface Props {
    offer: OfferI,
    size?: number, 
}

const AVATAR_COLOR_BY_CATEGORY: Record<string, string> = {
    ONSHORE: '#f97316',    // orange (distinct)
    OFFSHORE: '#059669',   // emerald green (distinct from blue)
    WIND: '#4338ca',       // indigo/purple (distinct)
};
const DEFAULT_AVATAR_COLOR = '#6B7280'; // neutral gray fallback

const OfferAvatarMock: React.FC<Props> = ({ offer, size }) => {

    if (offer?.avatarRef) {
        return null
    }

    const getAvatarColor = (category?: string): string => {
        if (!category) {
            return DEFAULT_AVATAR_COLOR;
        }
        return AVATAR_COLOR_BY_CATEGORY[category] ?? DEFAULT_AVATAR_COLOR;
    }

    const avatarColor = getAvatarColor(offer.category);

    return <AvatarMock
        color={avatarColor}
        letter={offer.displayName ? offer.displayName.charAt(0) : '?'}
        size={size}
    ></AvatarMock>
}

export default OfferAvatarMock;
