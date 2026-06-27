import { FriendshipI, FriendshipStatuses } from "@shared/interfaces/FriendshipI"
import { UserI } from "@shared/interfaces/UserI"
import { ChatService } from "chat/services/ChatService";
import { useFriendsContext } from "friends/FriendsProvider";
import Loading from "global/components/Loading";
import { Path } from "../../path";
import { useConfirm } from "global/providers/PopupProvider";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useUserContext } from "user/UserProvider";
import { FriendsService } from "friends/services/FriendsService";
import { FrontDateUtil } from "global/utils/FrontDateUtil";
import ListItem from "global/components/ListItem";
import Button from "global/components/controls/Button";
import { BtnModes, BtnSizes } from "global/interface/controls.interface";
import IconButton from "global/components/controls/IconButon";
import { Ico } from "global/icon.def";
import { AVATAR_MOCK } from "user/components/AvatarTile";

interface Props {
    user: UserI,
    friendship?: FriendshipI,
    first?: boolean,
    last?: boolean,
}

const FriendListItem: React.FC<Props> = ({ user, friendship, first, last }) => {

    const navigate = useNavigate();
    const { t } = useTranslation();
    const userCtx = useUserContext();
    const friendsCtx = useFriendsContext();
    const me = userCtx?.me;
    const confirm = useConfirm();

    const [loading, setLoading] = useState(false);
    const friendships = friendsCtx.friendships;

    useEffect(() => { 

        console.log()


 }, [friendships]);

    const acceptInvitation = async (e?: React.MouseEvent<HTMLButtonElement>) => {
        e?.stopPropagation();
        if (!friendship) return;
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
        if (!friendship) return;
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

    const getLastSeenText = () => {
        if (!user.lastSeenAt) return '';
        return `${t('user.lastSeen')} ${FrontDateUtil.displayShortDateOrDayOrTimeIfToday(t, user.lastSeenAt)}`
    }

    const getRightSection = () => {
        if (isInvitationReceived) {
            return <Button
                size={BtnSizes.SMALL}
                onClick={acceptInvitation}
            >{t('friends.accept')}</Button>
        }

        if (isInvited) {
            return <Button
                mode={BtnModes.ERROR_TXT}
                size={BtnSizes.SMALL}
                onClick={cancelInvitation}
            >{t('friends.cancel')}</Button>
        }
        if (isFriend && user.uid !== me?.uid) {
            return <IconButton onClick={(e) => {
                e.stopPropagation();
                openChat();
            }}
                icon={<Ico.MSG size={20} />}
            ></IconButton>
        }

        return null
    }

    const getBottomRow = () => {
        if (isFriend) {
            return <div className="secondary-text xs-font">
                {getLastSeenText()}
            </div>
        }
        if (isInvited) {
            return <div className="secondary-text xs-font">{t('friends.invited')}</div>
        }
        if (isInvitationReceived) {
            return <div className="secondary-text xs-font">{t('friends.invitationReceived')}</div>
        }
    }


    return (
        <div onClick={() => navigate(Path.getProfilePath(user.uid))}>
            <ListItem
                imgUrl={user?.avatarRef?.url || AVATAR_MOCK}
                topLeft={<div className="font-medium">{user?.displayName}</div>}
                bottomLeft={getBottomRow()}
                first={first}
                last={last}
                rightSection={<div className="flex justify-end items-center gap-2">{getRightSection()}</div>}
            />
        </div>
    )

}

export default FriendListItem;