import { UserI } from "@shared/interfaces/UserI";
import { useNavigate } from "react-router-dom";
import UserItem from "./UserItem";
import IconButton from "global/components/controls/IconButon";
import { useAuthContext } from "auth/AuthProvider";
import { FriendsService } from "friends/services/FriendsService";
import { useEffect, useState } from "react";
import Loading from "global/components/Loading";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Path } from "../../path";
import { useUserContext } from "user/UserProvider";
import { FriendshipStatuses } from "@shared/interfaces/FriendshipI";
import { useFriendsContext } from "friends/FriendsProvider";
import Button from "global/components/controls/Button";
import { BtnSizes } from "global/interface/controls.interface";
import { Ico } from "global/icon.def";

interface Props {
    user: UserI
}

const UserInvitationListItem: React.FC<Props> = ({ user }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const friendsCtx = useFriendsContext();
    const me = userCtx?.me; 

    const friendships = friendsCtx.friendships;

    useEffect(() => { { } }, [friendships]);

    const [loading, setLoading] = useState(false);

    const sendInvite = async () => {
        try {
            setLoading(true);
            const result = await FriendsService.sendInvite(user.uid);
            friendsCtx.putFriendship(result);
            toast.success(t('friends.invitationSent'));
            navigate(-1)
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <Loading></Loading>
    }

    const isMe = me?.uid === user.uid;

    const friendship = friendships.find(
        f => f.requesterUid === user.uid || f.addresseeUid === user.uid
    );

    const isFriend = friendship?.status === FriendshipStatuses.ACCEPTED;
    const isInvited = friendship?.status === FriendshipStatuses.PENDING && friendship.requesterUid === me?.uid;
    const isInvitationReceived = friendship?.status === FriendshipStatuses.PENDING && friendship.addresseeUid === me?.uid;

    const canInvite = !isMe && !isFriend && !isInvited && !isInvitationReceived;

    const acceptInvitation = async (e?: React.MouseEvent<HTMLButtonElement>) => {
        if (!friendship) return;
        e?.stopPropagation();
        try {
            setLoading(true);
            const result = await FriendsService.acceptInvite(friendship.friendshipId)
            navigate(Path.getProfilePath(user.uid));
            toast.success(t('friends.accept'));
        }
        finally {
            setLoading(false);
        }
    }


    return (
        <div className="flex justify-between items-center w-full" onClick={() => navigate(Path.getProfilePath(user.uid))}>
            <UserItem user={user} allowNavigate={false}></UserItem>

            {canInvite && <IconButton onClick={(e) => {
                e.stopPropagation();
                sendInvite();
            }}
                icon={<Ico.ADD_USER size={20} />}
            ></IconButton>}

            {isFriend && <div className="primary-color small-font">{t('friends.friend')}</div>}
            {isInvited && <div className="primary-color small-font">{t('friends.invited')}</div>}
            {isInvitationReceived && <Button
                size={BtnSizes.SMALL}
                onClick={acceptInvitation}
            >{t('friends.accept')}</Button>}
        </div>
    )
}

export default UserInvitationListItem;