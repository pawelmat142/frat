export const CloudinaryTags = {
    uid: (uid: string) => `uid:${uid}`,
    USER_AVATAR: 'user-avatar',
    AVATAR: 'avatar',
    TEMP: 'temp',
    WORKER_PROFILE: 'worker-profile',
} as const 

export type CloudinaryTag = (typeof CloudinaryTags)[keyof typeof CloudinaryTags];


export const CloudinaryFolderNames = {
    AVATARS: 'avatars',
    WORKER_PROFILE: 'worker-profile',
} as const;

export type CloudinaryFolderName = (typeof CloudinaryFolderNames)[keyof typeof CloudinaryFolderNames];