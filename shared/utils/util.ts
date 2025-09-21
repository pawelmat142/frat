export abstract class Util {
    public static displayDate(date: Date | string): string {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
    }
}