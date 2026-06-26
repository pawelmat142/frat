export const CloudinaryTags = {
    uid: (uid: string) => `uid:${uid}`,
    offerId: (offerId: string) => `offerId:${offerId}`,
    USER_AVATAR: 'user-avatar',
    AVATAR: 'avatar',
    OFFER_AVATAR: 'offer-avatar',
    TEMP: 'temp',
    WORKER_PROFILE: 'worker-profile',
    CHAT: 'chat',
    CHAT_IMAGE: 'chat-image',
    CHAT_FILE: 'chat-file',
    chatId: (chatId: string) => `chat-id:${chatId}`,
} as const 

export type CloudinaryTag = (typeof CloudinaryTags)[keyof typeof CloudinaryTags];


export const CloudinaryFolderNames = {
    AVATARS: 'avatars',
    OFFERS: 'offers',
    WORKER_PROFILE: 'worker-profile',
    CHAT_IMAGES: 'chat-images',
    CHAT_FILES: 'chat-files',
} as const;

export type CloudinaryFolderName = (typeof CloudinaryFolderNames)[keyof typeof CloudinaryFolderNames];