import removeAccents from 'remove-accents';

export abstract class Utils {
    public static isDevMode(): boolean {
        const isNodeDev = process.env.NODE_ENV === 'development';
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        return isNodeDev || isLocalhost;
    }

     // Util: remove diacritics (accents) from string using remove-accents library
    public static normalize = (str: string) => removeAccents(str).toLowerCase();
}