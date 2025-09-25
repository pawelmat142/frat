export abstract class Path {

    public static readonly HOME = '/';

    public static readonly ADMIN_PANEL = '/admin-panel';

    public static readonly ADMIN_DICTIONARIES = `${Path.ADMIN_PANEL}/dictionaries`;
    public static readonly ADMIN_DICTIONARY = `${Path.ADMIN_DICTIONARIES}/:code`;
    public static readonly ADMIN_DICTIONARIES_ADD = `${Path.ADMIN_PANEL}/dictionaries/add`;
    public static readonly ADMIN_DICTIONARIES_EDIT = `${Path.ADMIN_PANEL}/dictionaries/edit/:code`;

    public static readonly ADMIN_TRANSLATIONS = `${Path.ADMIN_PANEL}/translations`;
    
    public static getDictionaryPath = (code: string) => `${Path.ADMIN_DICTIONARIES}/${code}`;

    public static getEditDictionaryPath = (code: string) => `${Path.ADMIN_DICTIONARIES_EDIT.replace(':code', code)}`;
}

export const AdminRoutes = {
    DICTIONARIES: 'dictionaries',
    DICTIONARY: 'dictionary',
    TRANSLATIONS: 'translations'
} as const;

export type AdminRoutes = keyof typeof AdminRoutes;
