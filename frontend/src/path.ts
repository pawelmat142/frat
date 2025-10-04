export abstract class Path {

    public static readonly HOME = '/';

    public static readonly SIGN_IN = '/sign-in';
    public static readonly SIGN_UP = '/sign-up';
    
    public static readonly ERROR_PAGE = '/error';

    // ADMIN PANEL
    public static readonly ADMIN_PANEL = '/admin-panel';

    public static readonly ADMIN_DICTIONARIES = `${Path.ADMIN_PANEL}/dictionaries`;
    public static readonly ADMIN_DICTIONARY = `${Path.ADMIN_DICTIONARIES}/:code`;
    public static readonly ADMIN_DICTIONARIES_ADD = `${Path.ADMIN_PANEL}/dictionaries/add`;
    public static readonly ADMIN_DICTIONARIES_EDIT = `${Path.ADMIN_PANEL}/dictionaries/edit/:code`;
    public static readonly ADMIN_DICTIONARIES_GROUP = `${Path.ADMIN_PANEL}/dictionaries/:dictionaryCode/group-form/:groupCode`;

    public static readonly ADMIN_TRANSLATIONS = `${Path.ADMIN_PANEL}/translations`;
    public static readonly ADMIN_USERS = `${Path.ADMIN_PANEL}/users`;
    
    public static getDictionaryPath = (code: string) => `${Path.ADMIN_DICTIONARIES}/${code}`;
    public static getEditDictionaryPath = (code: string) => `${Path.ADMIN_DICTIONARIES_EDIT.replace(':code', code)}`;
    public static getDictionaryGroupFormPath = (dictionaryCode: string, groupCode: string) => `${Path.ADMIN_DICTIONARIES_GROUP.replace(':dictionaryCode', dictionaryCode).replace(':groupCode', groupCode)}`;
}
