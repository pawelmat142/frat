export const Dictionaries = {
    LANGUAGES: 'LANGUAGES',
} as const;

export type Dictionary = typeof Dictionaries[keyof typeof Dictionaries];