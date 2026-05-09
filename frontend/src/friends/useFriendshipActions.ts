import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useConfirm } from 'global/providers/PopupProvider';
import { useFriendsContext } from 'friends/FriendsProvider';
import { FriendsService } from 'friends/services/FriendsService';
import { FriendshipI } from '@shared/interfaces/FriendshipI';
import { ChatService } from 'chat/services/ChatService';
import { Path } from '../path';
import { useNavigate } from 'react-router-dom';

interface UseFriendshipActionsParams {
    targetUid: string;
}

export const useFriendshipActions = ({
    targetUid,
}: UseFriendshipActionsParams) => {
    const { t } = useTranslation();
    const confirm = useConfirm();
    const friendsCtx = useFriendsContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const getFriendship = useCallback((): FriendshipI | undefined => {
        return friendsCtx.friendships.find(f =>
            [f.addresseeUid, f.requesterUid].includes(targetUid)
        );
    }, [friendsCtx.friendships, targetUid]);

    const openChat = async () => {
        if (!targetUid) return;
        try {
            const chat = await ChatService.getOrCreateDirectChat(targetUid);
            navigate(Path.getConversationPath(chat.chatId));
        } catch (error) {
            console.error('Failed to open chat:', error);
            toast.error(t('chat.error.cannotOpen'));
        }
    }

    const sendInvite = useCallback(async () => {
        try {
            setLoading(true);
            const result = await FriendsService.sendInvite(targetUid);
            toast.success(t('friends.invitationSent'));
            friendsCtx.putFriendship(result);
        } catch (error) {
            console.error('Failed to send invite:', error);
            toast.error(t('friends.invitationFailed'));
        } finally {
            setLoading(false);
        }
    }, [targetUid, t, friendsCtx]);

    const removeFriend = useCallback(async (friendship: FriendshipI) => {
        const confirmed = await confirm({
            title: t('friends.remove'),
            message: t('friends.removeConfirm'),
        });
        if (!confirmed) return;

        try {
            setLoading(true);
            await FriendsService.removeFriend(friendship.friendshipId);
            await friendsCtx.initFriendships();
            toast.success(t('friends.removeSuccess'));
        } catch (error) {
            console.error('Remove friend error:', error);
            toast.error(t('friends.removeFailed'));
        } finally {
            setLoading(false);
        }
    }, [t, confirm]);

    const acceptInvitation = useCallback(async (friendship: FriendshipI) => {
        try {
            setLoading(true);
            const result = await FriendsService.acceptInvite(friendship.friendshipId);
            await friendsCtx.putFriendship(result);
            toast.success(t('friends.acceptedToast'));
        } catch (error) {
            console.error('Accept invitation error:', error);
            toast.error(t('friends.acceptFailed'));
        } finally {
            setLoading(false);
        }
    }, [t, friendsCtx]);

    const rejectInvitation = useCallback(async (friendship: FriendshipI) => {
        try {
            setLoading(true);
            const result = await FriendsService.rejectInvite(friendship.friendshipId);
            await friendsCtx.initFriendships();
            toast.success(t('friends.rejectedToast'));
        } catch (error) {
            console.error('Reject invitation error:', error);
            toast.error(t('friends.rejectFailed'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    return {
        loading,
        getFriendship,
        sendInvite,
        removeFriend,
        acceptInvitation,
        rejectInvitation,
        openChat,
    };
};
