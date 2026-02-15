import { UserI } from "@shared/interfaces/UserI";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "auth/AuthProvider";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Path } from "../../path";
import { useUserContext } from "user/UserProvider";
import { FriendshipI, FriendshipStatuses } from "@shared/interfaces/FriendshipI";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import UserItem from "user/components/UserItem";
import { useConfirm } from "global/providers/PopupProvider";
import { FriendsService } from "friends/services/FriendsService";
import { toast } from "react-toastify";
import Loading from "global/components/Loading";

interface Props {
    user: UserI,
    friendship: FriendshipI
}

const FriendshipListItem: React.FC<Props> = ({ user, friendship }) => {

    const navigate = useNavigate();
    const { me } = useAuthContext();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const confirm = useConfirm();

    const [loading, setLoading] = useState(false);
    const friendships = userCtx.friendships;

    useEffect(() => {{}}, [friendships]);

    const cancelInvitation = async (e?: React.MouseEvent<HTMLButtonElement>) => {
        e?.stopPropagation();
        const confirmed = await confirm({
            title: t('friends.cancelInvitation'),
            message: t('friends.cancelInvitationConfirm'),
            confirmText: t('common.yes'),
            cancelText: t('common.no'),
        });
        if (!confirmed) return;
        try {
            setLoading(true);
            const result = await FriendsService.rejectInvite(friendship.friendshipId)
            userCtx.initFriendships();
            toast.info(t('friends.cancelInvitationSuccess'));

        }
        finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <Loading></Loading>
    }

    const isFriend = friendship?.status === FriendshipStatuses.ACCEPTED;
    const isInvited = friendship?.status === FriendshipStatuses.PENDING && friendship.requesterUid === me?.uid;
    const isInvitationReceived = friendship?.status === FriendshipStatuses.PENDING && friendship.addresseeUid === me?.uid;
    
    return (
        <div className="flex justify-between items-center w-full" onClick={() => navigate(Path.getAccountPath(user.uid))}>
            <UserItem
             user={user}
              allowNavigate={false}
                bottomRow={
                    (isFriend && <div className="primary-color small-font">{t('friends.friend')}</div>)
                    || (isInvited && <div className="secondary-text small-font">{t('friends.invited')}</div>)
                    || (isInvitationReceived && <div className="secondary-text small-font">{t('friends.invitationReceived')}</div>)
                }
              ></UserItem>

            {isInvitationReceived && <Button
                size={BtnSizes.SMALL}
                onClick={(e) => {
                    // todo accept invitation
                }}
            >{t('friends.accept')}</Button>}

            {isInvited && <Button
                mode={BtnModes.ERROR_TXT}
                size={BtnSizes.SMALL}
                onClick={cancelInvitation}
            >{t('friends.cancel')}</Button>}


        </div>
    )
}

export default FriendshipListItem;