export interface UserListedItem {
    id: number
    uid: string
    reference: string
    referenceType: UserListedItemReferenceType;
    listedAt: Date;
    listedType: UserListedItemType;
    data?: any
}


export const UserListedItemTypes = {
    LIKE: 'LIKE',
    DEFAULT: 'DEFAULT',
} as const;
export type UserListedItemType = typeof UserListedItemTypes[keyof typeof UserListedItemTypes];

export const UserListedItemReferenceTypes = {
    OFFER: 'OFFER',
    WORKER: 'WORKER',
} as const;
export type UserListedItemReferenceType = typeof UserListedItemReferenceTypes[keyof typeof UserListedItemReferenceTypes];

export class AddUserListedItemDto {
    reference: string;

    referenceType: UserListedItemReferenceType;
}
