import { UserI } from "@shared/interfaces/UserI";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Path } from "../../path";
import { useUserContext } from "user/UserProvider";
import { FriendshipI, FriendshipStatuses } from "@shared/interfaces/FriendshipI";
import { useFriendsContext } from "friends/FriendsProvider";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import UserItem from "user/components/UserItem";
import { useConfirm } from "global/providers/PopupProvider";
import { FriendsService } from "friends/services/FriendsService";
import { toast } from "react-toastify";
import Loading from "global/components/Loading";
import { ChatService } from "chat/services/ChatService";
import IconButton from "global/components/controls/IconButon";
import { Ico } from "global/icon.def";

interface Props {
    user: UserI,
    friendship: FriendshipI
}

const FriendshipListItem: React.FC<Props> = ({ user, friendship }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const friendsCtx = useFriendsContext();
    const me = userCtx?.me;
    const confirm = useConfirm();

    const [loading, setLoading] = useState(false);
    const friendships = friendsCtx.friendships;

    useEffect(() => { { } }, [friendships]);

    const acceptInvitation = async (e?: React.MouseEvent<HTMLButtonElement>) => {
        e?.stopPropagation();
        try {
            setLoading(true);
            const result = await FriendsService.acceptInvite(friendship.friendshipId)
            toast.success(t('friends.accept'));
        }
        finally {
            setLoading(false);
        }
    }

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
            await FriendsService.rejectInvite(friendship.friendshipId)
            toast.info(t('friends.cancelInvitationSuccess'));
        }
        finally {
            setLoading(false);
        }
    }


    const openChat = async () => {
        try {
            const chat = await ChatService.getOrCreateDirectChat(user.uid)
            navigate(Path.getConversationPath(chat.chatId))
        } catch (error) {
            console.error('Failed to open chat:', error)
            toast.error(t('chat.error.cannotOpen'))
        }
    }

    if (loading) {
        return <Loading></Loading>
    }

    const isFriend = friendship?.status === FriendshipStatuses.ACCEPTED;
    const isInvited = friendship?.status === FriendshipStatuses.PENDING && friendship.requesterUid === me?.uid;
    const isInvitationReceived = friendship?.status === FriendshipStatuses.PENDING && friendship.addresseeUid === me?.uid;

    return (
        <div className="flex justify-between items-center w-full" onClick={() => navigate(Path.getProfilePath(user.uid))}>
            <UserItem
                user={user}
                allowNavigate={false}
                bottomRow={
                    (isFriend && <div className="primary-color xs-font">{t('friends.friend')}</div>)
                    || (isInvited && <div className="secondary-text xs-font">{t('friends.invited')}</div>)
                    || (isInvitationReceived && <div className="secondary-text xs-font">{t('friends.invitationReceived')}</div>)
                }
            ></UserItem>

            {isInvitationReceived && <Button
                size={BtnSizes.SMALL}
                onClick={acceptInvitation}
            >{t('friends.accept')}</Button>}

            {isInvited && <Button
                mode={BtnModes.ERROR_TXT}
                size={BtnSizes.SMALL}
                onClick={cancelInvitation}
            >{t('friends.cancel')}</Button>}

            {isFriend && user.uid !== me?.uid && <IconButton onClick={(e) => {
                e.stopPropagation();
                openChat();
            }}
                icon={<Ico.MSG size={20} />}
            ></IconButton>}

        </div>
    )
}

export default FriendshipListItem;