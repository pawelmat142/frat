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
    LIGHT3: 'light3',
    DARK3: 'dark3',
    LIGHT4: 'light4',
    DARK4: 'dark4',
    LIGHT5: 'light5',
    DARK5: 'dark5',
} as const;

export type Theme = typeof Themes[keyof typeof Themes];

export const defaultTheme = {
    light: Themes.LIGHT4,
    dark: Themes.DARK4,
};

export const defaultSettings: SettingsI = {
    uid: '',
    theme: defaultTheme.dark,
    languageCode: 'en',
}
