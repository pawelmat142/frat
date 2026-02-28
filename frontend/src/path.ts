export abstract class Path {

    public static readonly HOME = '/';

    public static readonly SIGN_IN = '/sign-in';
    public static readonly SIGN_UP = '/sign-up';
    public static readonly TELEGRAM_SIGN = `${Path.SIGN_IN}/telegram`;
    public static readonly FORGOT_PASSWORD = '/forgot-password';

    public static readonly PROFILE = '/profile/:uid';
    public static readonly CHATS = '/chat';
    public static readonly CHAT_CONVERSATION = '/chat/:chatId';
    public static readonly FRIENDS = '/friends/:uid';
    public static readonly FRIENDS_SEARCH = '/friends-search';
    public static readonly NOTIFICATIONS = '/notifications';
    public static readonly NOTIFICATION = '/notifications/:notificationId';
    public static readonly SETTINGS = '/settings';

    // EMPLOYEE PROFILES
    public static readonly WORKER = '/worker/:displayName';
    public static readonly WORKER_FORM = '/worker-form';
    public static readonly WORKERS_SEARCH = '/workers-search';    
    public static readonly WORKERS_FILTERS_SEARCH = `/workers-filters-search`;

    // OFFERS
    public static readonly OFFER_FORM = '/offer-form';
    public static readonly OFFER_FORM_EDIT = '/offer-form/:offerId';
    public static readonly OFFERS_SEARCH = '/offers-search';
    public static readonly OFFER = '/offer/:offerId';
    public static readonly USER_OFFERS = '/offers/:uid';

    public static readonly ERROR_PAGE = '/error';

    // ADMIN PANEL
    public static readonly ADMIN_PANEL = '/admin-panel';

    public static readonly ADMIN_DICTIONARIES = `${Path.ADMIN_PANEL}/dictionaries`;
    public static readonly ADMIN_DICTIONARY = `${Path.ADMIN_DICTIONARIES}/:code`;
    public static readonly ADMIN_DICTIONARIES_ADD = `${Path.ADMIN_PANEL}/dictionaries/add`;
    public static readonly ADMIN_DICTIONARIES_EDIT = `${Path.ADMIN_PANEL}/dictionaries/edit/:code`;
    public static readonly ADMIN_DICTIONARIES_GROUP = `${Path.ADMIN_PANEL}/dictionaries/:dictionaryCode/group-form/:groupCode`;

    public static readonly ADMIN_TRANSLATIONS = `${Path.ADMIN_PANEL}/translations`;
    public static readonly ADMIN_TRANSLATION_ITEM = `${Path.ADMIN_TRANSLATIONS}/:path`;
    public static readonly ADMIN_USERS = `${Path.ADMIN_PANEL}/users`;
    public static readonly ADMIN_FEEDBACKS = `${Path.ADMIN_PANEL}/feedbacks`;
    public static readonly ADMIN_EMPLOYEE_PROFILES = `${Path.ADMIN_PANEL}/workers`;
    public static readonly ADMIN_OFFERS = `${Path.ADMIN_PANEL}/offers`;

    public static getDictionaryPath = (code: string) => `${Path.ADMIN_DICTIONARIES}/${code}`;
    public static getEditDictionaryPath = (code: string) => `${Path.ADMIN_DICTIONARIES_EDIT.replace(':code', code)}`;
    public static getDictionaryGroupFormPath = (dictionaryCode: string, groupCode: string) => `${Path.ADMIN_DICTIONARIES_GROUP.replace(':dictionaryCode', dictionaryCode).replace(':groupCode', groupCode)}`;
    public static getProfilePath = (uid: string) => `${Path.PROFILE.replace(':uid', uid)}`;
    public static getWorkerProfilePath = (displayName: string) => `${Path.WORKER.replace(':displayName', displayName)}`;
    public static getOfferPath = (offerId: number) => `${Path.OFFER.replace(':offerId', `${offerId}`)}`;
    public static getOffersPath = (uid: string) => `${Path.USER_OFFERS.replace(':uid', uid)}`;
    public static getOfferFormEditPath = (offerId: number) => `${Path.OFFER_FORM_EDIT.replace(':offerId', `${offerId}`)}`;
    public static getConversationPath = (chatId: number) => `${Path.CHAT_CONVERSATION.replace(':chatId', `${chatId}`)}`;
    public static getFriendsPath = (uid: string) => `${Path.FRIENDS.replace(':uid', uid)}`;
    public static getNotificationPath = (notificationId: string) => `${Path.NOTIFICATION.replace(':notificationId', `${notificationId}`)}`;
    public static getTranslationItemPath = (path: string) => `${Path.ADMIN_TRANSLATION_ITEM.replace(':path', path)}`;
}
