export const CloudinaryTags = {
    uid: (uid: string) => `uid:${uid}`,
    USER_AVATAR: 'user-avatar',
    AVATAR: 'avatar',
    TEMP: 'temp',
    WORKER_PROFILE: 'worker-profile',
    CHAT: 'chat',
    CHAT_IMAGE: 'chat-image',
    chatId: (chatId: string) => `chat-id:${chatId}`,
} as const 

export type CloudinaryTag = (typeof CloudinaryTags)[keyof typeof CloudinaryTags];


export const CloudinaryFolderNames = {
    AVATARS: 'avatars',
    WORKER_PROFILE: 'worker-profile',
    CHAT_IMAGES: 'chat-images',
} as const;

export type CloudinaryFolderName = (typeof CloudinaryFolderNames)[keyof typeof CloudinaryFolderNames];