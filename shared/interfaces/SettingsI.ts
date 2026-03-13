export interface SettingsI {
    uid: string;
    theme: Theme;
    languageCode: string;
}

export const Themes = {
    LIGHT: 'light',
    DARK: 'dark',
    LIGHT1: 'light1',
    DARK1: 'dark1',
    LIGHT2: 'light2',
    DARK2: 'dark2',
} as const;

export type Theme = typeof Themes[keyof typeof Themes];

export const defaultSettings: SettingsI = {
    uid: '',
    theme: Themes.LIGHT,
    languageCode: 'en',
}
