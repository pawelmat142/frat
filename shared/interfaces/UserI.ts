export interface UserI {
    uid: string
    version: number
    status: UserStatus
    roles: UserRole[]
    displayName: string
    email: string
    provider: UserProvider
    verified: boolean
    photoURL?: string
    avatarRef?: AvatarRef
}

export const UserRoles = {
    SUPERADMIN: 'SUPERADMIN',
    ADMIN: 'ADMIN',
    USER: 'USER',
    EMPLOYER: 'EMPLOYER',
} as const;

export type UserRole = typeof UserRoles[keyof typeof UserRoles];


export const UserStatuses = {
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
} as const;

export type UserStatus = typeof UserStatuses[keyof typeof UserStatuses];

export const UserProviders = {
    EMAIL: 'EMAIL',
    GOOGLE: 'GOOGLE',
    FACEBOOK: 'FACEBOOK',
    APPLE: 'APPLE',
} as const;

export type UserProvider = typeof UserProviders[keyof typeof UserProviders];


export interface AvatarRef {
    url: string;
    publicId: string;
}
