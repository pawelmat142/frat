export abstract class Path {

    public static readonly HOME = '/';

    public static readonly ADMIN_PANEL = '/admin-panel';
    public static readonly ADMIN_DICTIONARIES = `${Path.ADMIN_PANEL}/dictionaries`;
    public static readonly ADMIN_TRANSLATIONS = `${Path.ADMIN_PANEL}/translations`;
}

export const AdminRoutes = {
    DICTIONARIES: 'dictionaries',
    TRANSLATIONS: 'translations'
} as const;

export type AdminRoutes = keyof typeof AdminRoutes;