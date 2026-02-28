export interface SettingsI {
    uid: string;
    theme: ThemeType;
    languageCode: string;
}

export const Themes = {
    LIGHT: 'light',
    DARK: 'dark',
} as const;

export type ThemeType = typeof Themes[keyof typeof Themes];

export const defaultSettings: SettingsI = {
    uid: '',
    theme: Themes.LIGHT,
    languageCode: 'en',
}
