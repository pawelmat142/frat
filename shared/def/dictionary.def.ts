export const Dictionaries = {
    LANGUAGES: 'LANGUAGES',
    CERTIFICATES: 'CERTIFICATES',
    WORK_CATEGORY: 'WORK_CATEGORY'
} as const;

export type Dictionary = typeof Dictionaries[keyof typeof Dictionaries];