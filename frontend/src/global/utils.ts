export abstract class Utils {
    public static isDevMode(): boolean {
        const isNodeDev = process.env.NODE_ENV === 'development';
        const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';
        return isNodeDev || isLocalhost;
    }
}