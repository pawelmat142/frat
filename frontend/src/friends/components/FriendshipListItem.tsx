import { UserI } from "@shared/interfaces/UserI";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "auth/AuthProvider";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Path } from "../../path";
import { useUserContext } from "user/UserProvider";
import { FriendshipI, FriendshipStatuses } from "@shared/interfaces/FriendshipI";
import Button from "global/components/controls/Button";
import { BtnSizes } from "global/interface/controls.interface";
import UserItem from "user/components/UserItem";

interface Props {
    user: UserI,
    friendship: FriendshipI
}

const FriendshipListItem: React.FC<Props> = ({ user, friendship }) => {

    const navigate = useNavigate();
    const { me } = useAuthContext();
    const { t } = useTranslation();
    const userCtx = useUserContext();

    const friendships = userCtx.friendships;

    useEffect(() => {{}}, [friendships]);

    const isFriend = friendship?.status === FriendshipStatuses.ACCEPTED;
    const isInvited = friendship?.status === FriendshipStatuses.PENDING && friendship.requesterUid === me?.uid;
    const isInvitationReceived = friendship?.status === FriendshipStatuses.PENDING && friendship.addresseeUid === me?.uid;
    
    return (
        <div className="flex justify-between items-center w-full" onClick={() => navigate(Path.getAccountPath(user.uid))}>
            <UserItem user={user} allowNavigate={false}></UserItem>

            {isInvitationReceived && <Button
                size={BtnSizes.SMALL}
                onClick={(e) => {
                    // todo accept invitation
                }}
            >{t('friends.accept')}</Button>}

            {isFriend && <div className="primary-color small-font">{t('friends.friend')}</div>}
            {isInvited && <div className="primary-color small-font">{t('friends.invited')}</div>}
        </div>
    )
}

export default FriendshipListItem;