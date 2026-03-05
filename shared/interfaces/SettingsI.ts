export interface SettingsI {
    uid: string;
    theme: Theme;
    languageCode: string;
}

export const Themes = {
    LIGHT: 'light',
    DARK: 'dark',
} as const;

export type Theme = typeof Themes[keyof typeof Themes];

export const defaultSettings: SettingsI = {
    uid: '',
    theme: Themes.LIGHT,
    languageCode: 'en',
}
