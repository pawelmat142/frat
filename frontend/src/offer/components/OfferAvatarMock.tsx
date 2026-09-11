import { AppConfig } from "@shared/AppConfig";
import { OfferI } from "@shared/interfaces/OfferI";
import AvatarMock from "global/components/AvatarMock";

interface Props {
    offer: OfferI,
    size?: number, 
}

const OfferAvatarMock: React.FC<Props> = ({ offer, size }) => {

    if (offer?.avatarRef) {
        return null
    }

    const getAvatarColor = (category?: string): string => {
        if (!category) {
            return AppConfig.AVATAR.DEFAULT_COLOR;
        }
        return (AppConfig.AVATAR.COLOR_BY_CATEGORY as Record<string, string>)[category] ?? AppConfig.AVATAR.DEFAULT_COLOR;
    }

    const avatarColor = getAvatarColor(offer.category);

    return <AvatarMock
        color={avatarColor}
        letter={offer.displayName ? offer.displayName.charAt(0) : '?'}
        size={size}
    ></AvatarMock>
}

export default OfferAvatarMock;
