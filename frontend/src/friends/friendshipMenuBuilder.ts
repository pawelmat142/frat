import { FriendshipI, FriendshipStatuses } from '@shared/interfaces/FriendshipI';
import { MenuItem } from 'global/interface/controls.interface';
import { Ico } from 'global/icon.def';
import { TFunction } from 'i18next';

interface FriendshipMenuItemsConfig {
    t: TFunction;
    isMyAccount: boolean;
    friendship: FriendshipI | null | undefined;
    me: { uid: string } | null | undefined;
    onSendInvite: () => void;
    onRemoveFriend: (friendship: FriendshipI) => void;
    onAcceptInvitation: (friendship: FriendshipI) => void;
    onRejectInvitation: (friendship: FriendshipI) => void;
    onOpenChat: () => void;
}

/**
 * Builds friendship-related menu items
 * Handles invite, accept, reject, and remove friend actions
 */
export const buildFriendshipMenuItems = ({
    t,
    isMyAccount,
    friendship,
    me,
    onSendInvite,
    onRemoveFriend,
    onAcceptInvitation,
    onRejectInvitation,
    onOpenChat,
}: FriendshipMenuItemsConfig): MenuItem[] => {
    return [
        {
            label: t('chat.openChat'),
            if: !isMyAccount,
            icon: Ico.CHAT,
            onClick: onOpenChat
        },
        {
            label: t('friends.invite'),
            if: !isMyAccount && (!friendship || friendship.status === FriendshipStatuses.REJECTED),
            icon: Ico.FRIENDS,
            onClick: onSendInvite,
        },
        {
            label: t('friends.reject'),
            if: friendship?.status === FriendshipStatuses.PENDING,
            onClick: () => onRejectInvitation(friendship!),
            icon: Ico.CANCEL,
        },
        {
            label: t('friends.accept'),
            if: friendship?.status === FriendshipStatuses.PENDING && friendship.addresseeUid === me?.uid,
            onClick: () => onAcceptInvitation(friendship!),
            icon: Ico.FRIENDS,
        },
        {
            label: t('friends.remove'),
            if: friendship?.status === FriendshipStatuses.ACCEPTED,
            onClick: () => onRemoveFriend(friendship!),
            icon: Ico.DELETE,
        },
    ];
};
