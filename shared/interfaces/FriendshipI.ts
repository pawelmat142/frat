export interface FriendshipI {
    friendshipId: number;
    requesterUid: string;
    addresseeUid: string;
    status: FriendshipStatus;
    createdAt: Date;
    updatedAt: Date;
}

export const FriendshipStatuses = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
} as const;

export type FriendshipStatus = typeof FriendshipStatuses[keyof typeof FriendshipStatuses];

export const FriendshipEvents = {
    INVITE_RECEIVED: 'inviteReceived',
    INVITE_ACCEPTED: 'inviteAccepted',
    INVITE_REJECTED: 'inviteRejected',
    FRIEND_REMOVED: 'friendRemoved',
} as const;

export type FriendshipEvent = typeof FriendshipEvents[keyof typeof FriendshipEvents];
